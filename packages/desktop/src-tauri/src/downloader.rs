use futures::StreamExt;
use reqwest;
use std::fs;
use std::io::Write;
use std::path;

pub async fn download<F>(url: String, output: String, mut on_progress: F) -> Result<(), ()>
where
    F: FnMut(f32) + Send + 'static,
{
    let mut temp_output = path::PathBuf::from(&output);
    temp_output.set_extension("download");
    let mut file = fs::File::create(&temp_output).or(Err(()))?;

    let response = reqwest::get(&url).await.or(Err(()))?;
    let total_size = response.content_length().ok_or(())?;
    let mut downloaded: u64 = 0;
    let mut stream = response.bytes_stream();
    while let Some(item) = stream.next().await {
        let chunk = item.map_err(|_| ())?;
        file.write_all(&chunk).map_err(|_| ())?;
        downloaded += chunk.len() as u64;

        let progress = downloaded as f32 / total_size as f32;
        on_progress(progress);
    }
    drop(file);
    fs::rename(&temp_output, &output).or(Err(()))?;

    Ok(())
}
