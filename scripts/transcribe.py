"""FunASR transcription script for Flowcast.
Usage: python scripts/transcribe.py --audio <wav_path> --model-dir <dir>
Outputs the transcribed text to stdout.
"""
import argparse
import sys
import os

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--audio", required=True, help="Path to 16kHz mono WAV file")
    parser.add_argument("--model-dir", required=True, help="FunASR model directory")
    args = parser.parse_args()

    if not os.path.exists(args.audio):
        print(f"Audio file not found: {args.audio}", file=sys.stderr)
        sys.exit(1)

    try:
        from funasr import AutoModel
    except ImportError:
        print("funasr not installed. Run: pip install funasr", file=sys.stderr)
        sys.exit(1)

    model = AutoModel(
        model=args.model_dir,
        disable_update=True,
    )

    result = model.generate(input=args.audio, language="zh")
    if result and len(result) > 0:
        text = result[0].get("text", "")
        print(text.strip())
    else:
        print("")

if __name__ == "__main__":
    main()
