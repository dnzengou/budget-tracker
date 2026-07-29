use rust_embed::RustEmbed;
use serde::Deserialize;

#[derive(RustEmbed)]
#[folder = "../skills/"]
struct Bundle;

#[derive(Deserialize, serde::Serialize)]
struct SkillMeta {
    id: String,
    name: String,
    file: String,
    category: String,
    tags: Vec<String>,
    overlay: bool,
}

#[derive(Deserialize)]
struct Index {
    skills: Vec<SkillMeta>,
}

fn load_index() -> Index {
    let raw = Bundle::get("index.json").expect("index.json missing");
    serde_json::from_slice(&raw.data).expect("index.json malformed")
}

#[tauri::command]
fn list_skills() -> Vec<SkillMeta> {
    load_index().skills
}

#[tauri::command]
fn get_skill(skill_id: String) -> Result<String, String> {
    let idx = load_index();
    let meta = idx
        .skills
        .into_iter()
        .find(|s| s.id == skill_id)
        .ok_or_else(|| format!("skill not found: {skill_id}"))?;
    let raw = Bundle::get(&meta.file).ok_or("file missing")?;
    Ok(String::from_utf8_lossy(&raw.data).into_owned())
}

#[tauri::command]
fn compose_skills(skill_ids: Vec<String>) -> Result<String, String> {
    let mut parts = Vec::with_capacity(skill_ids.len());
    for id in &skill_ids {
        parts.push(get_skill(id.clone())?);
    }
    Ok(parts.join("\n\n---\n\n"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![list_skills, get_skill, compose_skills])
        .run(tauri::generate_context!())
        .expect("error running tauri app");
}
