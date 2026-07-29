use clap::{Parser, Subcommand};
use rust_embed::RustEmbed;
use serde::Deserialize;
use std::process::ExitCode;

#[derive(RustEmbed)]
#[folder = "../skills/"]
struct Bundle;

#[derive(Deserialize)]
struct Index {
    skills: Vec<SkillMeta>,
}

#[derive(Deserialize)]
struct SkillMeta {
    id: String,
    file: String,
}

#[derive(Parser)]
#[command(name = "claude-skills", version, about = "Distributable Claude skill bundle CLI")]
struct Cli {
    #[command(subcommand)]
    cmd: Cmd,
}

#[derive(Subcommand)]
enum Cmd {
    List,
    Show { skill_id: String },
    Compose { skill_ids: Vec<String> },
}

fn load_index() -> Index {
    let raw = Bundle::get("index.json").expect("index.json missing in bundle");
    serde_json::from_slice(&raw.data).expect("index.json malformed")
}

fn read_skill(id: &str) -> Option<String> {
    let idx = load_index();
    let meta = idx.skills.into_iter().find(|s| s.id == id)?;
    let raw = Bundle::get(&meta.file)?;
    Some(String::from_utf8_lossy(&raw.data).into_owned())
}

fn main() -> ExitCode {
    let cli = Cli::parse();
    match cli.cmd {
        Cmd::List => {
            for s in load_index().skills {
                println!("{}", s.id);
            }
        }
        Cmd::Show { skill_id } => match read_skill(&skill_id) {
            Some(p) => println!("{}", p),
            None => {
                eprintln!("skill not found: {}", skill_id);
                return ExitCode::from(1);
            }
        },
        Cmd::Compose { skill_ids } => {
            let mut parts = Vec::with_capacity(skill_ids.len());
            for id in &skill_ids {
                match read_skill(id) {
                    Some(p) => parts.push(p),
                    None => {
                        eprintln!("skill not found: {}", id);
                        return ExitCode::from(1);
                    }
                }
            }
            println!("{}", parts.join("\n\n---\n\n"));
        }
    }
    ExitCode::SUCCESS
}
