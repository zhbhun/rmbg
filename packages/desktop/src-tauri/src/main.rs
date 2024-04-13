// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::io::{Read, Write};
use std::path::Path;
use tauri::{api::path::app_cache_dir, api::path::app_config_dir, Manager};

mod downloader;
mod rmbg;

#[tauri::command]
async fn load_config(app_handle: tauri::AppHandle) -> Result<String, ()> {
    let app_config = app_handle.config();
    let config_dir = app_config_dir(&app_config).ok_or(())?;
    let config_path = config_dir.join("config.json");
    let mut config_file = fs::File::open(config_path).or(Err(()))?;
    let mut config = String::new();
    config_file.read_to_string(&mut config).or(Err(()))?;
    Ok(config)
}

#[tauri::command]
async fn save_config(config: String, app_handle: tauri::AppHandle) -> Result<(), ()> {
    let app_config = app_handle.config();
    let config_dir = app_config_dir(&app_config).ok_or(())?;
    fs::create_dir_all(&config_dir).or(Err(()))?;

    let config_path = config_dir.join("config.json");
    let mut file = fs::File::create(config_path).or(Err(()))?;
    file.write_all(config.as_bytes()).or(Err(()))?;
    Ok(())
}

#[tauri::command]
async fn download_model(
    name: String,
    version: String,
    url: String,
    app_handle: tauri::AppHandle,
) -> Result<String, ()> {
    let app_config = app_handle.config();
    let cache_dir = app_cache_dir(&app_config).ok_or(())?;
    fs::create_dir_all(&cache_dir).or(Err(()))?;

    let output_path = Path::new(&cache_dir).join(format!("{}-{}.onnx", name, version));
    let output = output_path.to_str().ok_or(())?;
    downloader::download(url, output.to_string(), move |progress| {
        app_handle
            .emit_all(&format!("model/download/progress/{}", &name), progress)
            .unwrap();
    })
    .await?;
    Ok(output.to_string())
}

#[tauri::command]
async fn rmbg(file: String, model: String, resolution: u32) -> Result<String, ()> {
    match rmbg::process_image(file.as_str(), model.as_str(), resolution) {
        Ok(image) => Ok(image),
        Err(_) => Err(()),
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            load_config,
            save_config,
            download_model,
            rmbg
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
