#py_to_md.py
import os

def check_and_generate_md(*extensions):
    current_dir = os.getcwd()
    files = [file for file in os.listdir(current_dir) if file.endswith(extensions) and file != "py_to_md.py"]
    code_blocks = []
    
    for file in files:
        with open(file, 'r') as file:
            lines = file.readlines()
            if lines and lines[0].strip() != f'#{file}':
                lines.insert(0, f'#{file}\n')
                print(f"Added missing line in {file}")
            
            code_blocks.append(f"{file.name}:\n```\n{''.join(lines)}\n\n\n```")

    md_content = "\n\n\n\n\n\n".join(code_blocks)
    with open('code.md', 'w') as md_file:
        md_file.write(md_content)

    print("code.md file generated successfully!")


if __name__ == "__main__":
    # Change the working directory to the directory of this file
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    check_and_generate_md(".js", ".html")