import argparse
import json
from pathlib import Path

from funasr import AutoModel


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Transcribe a wav file with a local FunASR model.")
    parser.add_argument("--model-dir", required=True, help="Local model directory or ModelScope/FunASR model id.")
    parser.add_argument("--audio", required=True, help="Input audio file path.")
    parser.add_argument("--out-json", required=True, help="Output JSON file path.")
    parser.add_argument("--out-text", required=True, help="Output plain transcript file path.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    model_ref = args.model_dir
    model_path = Path(model_ref)
    audio_path = Path(args.audio)
    out_json = Path(args.out_json)
    out_text = Path(args.out_text)

    if not audio_path.exists():
        raise FileNotFoundError(f"Audio file does not exist: {audio_path}")

    out_json.parent.mkdir(parents=True, exist_ok=True)
    out_text.parent.mkdir(parents=True, exist_ok=True)

    model = AutoModel(model=str(model_path) if model_path.exists() else model_ref, device="cpu", disable_update=True)
    result = model.generate(input=str(audio_path))

    texts = []
    if isinstance(result, list):
        for item in result:
            if isinstance(item, dict) and item.get("text"):
                texts.append(str(item["text"]))
    elif isinstance(result, dict) and result.get("text"):
        texts.append(str(result["text"]))

    transcript = "\n".join(text.strip() for text in texts if text.strip())

    out_json.write_text(
        json.dumps({"text": transcript, "raw": result}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    out_text.write_text(transcript, encoding="utf-8")

    print(transcript)


if __name__ == "__main__":
    main()
