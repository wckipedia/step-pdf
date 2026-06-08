import sys

from pdf2docx import Converter


def main() -> None:
    if len(sys.argv) != 3:
        print("Usage: pdf_to_docx.py <input.pdf> <output.docx>", file=sys.stderr)
        sys.exit(1)

    input_path, output_path = sys.argv[1], sys.argv[2]
    converter = Converter(input_path)
    try:
        converter.convert(output_path)
    finally:
        converter.close()


if __name__ == "__main__":
    main()
