use anyhow::{anyhow, Result};
use image::{imageops::FilterType, GenericImageView, ImageBuffer, ImageFormat, Rgba};
use ndarray::Array;
use ort::{inputs, CUDAExecutionProvider, Session};
use std::{fs, ops::Mul, path};
use tauri::api::path::download_dir;

fn get_unique_file_path<P: AsRef<path::Path>>(path: P) -> Result<path::PathBuf> {
    println!("path {}", path.as_ref().display());
    let mut count = 0;
    let input_path_buf = path.as_ref().to_path_buf();
    let mut output_path_buf = path.as_ref().to_path_buf();
    while output_path_buf.exists() {
        count += 1;
        let new_file_name = if let Some(ext) = output_path_buf.extension() {
            format!(
                "{}_{}.{}",
                input_path_buf
                    .file_stem()
                    .ok_or_else(|| anyhow!("Failed to extract the stem!"))?
                    .to_str()
                    .ok_or_else(|| anyhow!("Failed to convert the stem to string!"))?,
                count,
                ext.to_str()
                    .ok_or_else(|| anyhow!("Failed to convert the stem to string!"))?
            )
        } else {
            format!(
                "{}_{}",
                input_path_buf
                    .file_stem()
                    .ok_or_else(|| anyhow!("Failed to extract the stem!"))?
                    .to_str()
                    .ok_or_else(|| anyhow!("Failed to convert the stem to string!"))?,
                count
            )
        };
        output_path_buf.set_file_name(new_file_name);
    }
    return Ok(output_path_buf);
}

pub fn process_image(input: &str, model: &str, resolution: u32) -> Result<String> {
    let mime_type = mime_guess::from_path(path::Path::new(input)).first_or_octet_stream();
    if mime_type.type_() != "image" {
        return Err(anyhow!("File type is not supported"));
    }

    ort::init()
        .with_execution_providers([CUDAExecutionProvider::default().build()])
        .commit()?;

    let model =
        Session::builder()?.commit_from_file(model)?;
    let model_input = &model
        .inputs
        .get(0)
        .ok_or_else(|| anyhow!("Failed to get input info!"))?;
    let model_output = &model
        .outputs
        .get(0)
        .ok_or_else(|| anyhow!("Failed to get output info!"))?;

    let model_width = resolution;
    let model_height = resolution;

    println!("input: {:?}", model_input);
    println!("output: {:?}", model_output);
    println!(
        "input dimensions: {:?}",
        model_input.input_type.tensor_dimensions()
    );

    let input_path = path::Path::new(input);
    let input_file = image::open(input_path).unwrap();
    let (img_width, img_height) = (input_file.width(), input_file.height());
    let resized_img = input_file.resize_exact(model_width, model_height, FilterType::Triangle);
    let mut input = Array::zeros((1, 3, model_width as usize, model_height as usize));
    for pixel in resized_img.pixels() {
        let x = pixel.0 as _;
        let y = pixel.1 as _;
        let [r, g, b, _] = pixel.2 .0;
        input[[0, 0, y, x]] = (r as f32 - 127.5) / 127.5;
        input[[0, 1, y, x]] = (g as f32 - 127.5) / 127.5;
        input[[0, 2, y, x]] = (b as f32 - 127.5) / 127.5;
    }

    let outputs = model.run(inputs![&model_input.name => input.view()]?)?;
    let output = outputs[model_output.name.as_ref()].try_extract_tensor::<f32>()?;
    // convert to 8-bit
    let output = output.mul(255.0).map(|x| *x as u8);
    let output = output.into_raw_vec();

    // change rgb to rgba
    let output_img = ImageBuffer::from_fn(model_width, model_height, |x, y| {
        let i = (x + y * model_width) as usize;
        Rgba([output[i], output[i], output[i], 255])
    });
    let mut output_img =
        image::imageops::resize(&output_img, img_width, img_height, FilterType::Triangle);
    output_img.enumerate_pixels_mut().for_each(|(x, y, pixel)| {
        let origin = input_file.get_pixel(x, y);
        pixel.0[3] = pixel.0[0];
        pixel.0[0] = origin.0[0];
        pixel.0[1] = origin.0[1];
        pixel.0[2] = origin.0[2];
    });

    let output_dir = download_dir().ok_or_else(|| anyhow!("Download director not found!"))?;
    let output_path = path::Path::new(&output_dir);
    fs::create_dir_all(&output_path)?;
    let file_name = format!(
        "{}-rmbg.png",
        input_path
            .file_stem()
            .ok_or_else(|| anyhow!("Failed to extract the file stem!"))?
            .to_string_lossy()
            .to_string()
    );
    let file_path = get_unique_file_path(output_path.join(file_name))?;
    let file_path_str = file_path.display().to_string();

    output_img.save_with_format(file_path, ImageFormat::Png)?;

    return Ok(file_path_str);
}
