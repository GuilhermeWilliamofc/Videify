import sys
import os
from rembg import remove
from PIL import Image

def main():
    if len(sys.argv) < 3:
        print("ERROR: Uso incorreto. Requer entrada e saída.")
        sys.exit(1)
        
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    
    # We must print the following lines in expected formats if we want to catch them via stdout
    print(f"TITLE:{os.path.basename(output_path)}")
    print("STATUS:Processando imagem, por favor aguarde...")
    print("PROGRESS:25")
    
    try:
        if not os.path.exists(input_path):
            print(f"ERROR:O arquivo de entrada nao foi encontrado ({input_path}).")
            sys.exit(1)
            
        # processamento da imagem
        print("PROGRESS:50")
        input_image = Image.open(input_path)
        output_image = remove(input_image)
        
        # salva o resultado
        print("PROGRESS:90")
        output_image.save(output_path, "PNG")
        
        print("PROGRESS:100")
        print(f"DONE:{output_path}")
        
    except Exception as e:
        print(f"ERROR:{str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
