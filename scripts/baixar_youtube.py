import sys
import os
import re
import unicodedata
import pytubefix
from pytubefix import YouTube
import subprocess
import urllib.request

url = sys.argv[1]
formato = sys.argv[2] if len(sys.argv) > 2 else "video"
# Pasta de destino passada pelo servidor Node.js (o DOWNLOADS_DIR persistente)
downloads_base = sys.argv[3] if len(sys.argv) > 3 else "Downloads"

def on_progress(stream, chunk, bytes_remaining):
    total_size = stream.filesize
    bytes_downloaded = total_size - bytes_remaining
    if total_size > 0:
        percentage = (bytes_downloaded / total_size) * 100
        print(f"PROGRESS:{percentage:.2f}", flush=True)

def sanitizar_nome(nome):
    # Normaliza unicode (ex: converte caracteres compostos)
    nome = unicodedata.normalize('NFKC', nome)

    # Whitelist de caracteres permitidos no nome do arquivo:
    # - Letras (incluindo acentuadas): \w cobre [a-zA-Z0-9_] + unicode letters
    # - Dígitos: 0-9
    # - Espaço
    # - Parênteses: ( )
    # - Colchetes: [ ]
    # - Hífen literal: -
    # - Apóstrofo / aspas simples: '
    # - Ponto: .
    # - Vírgula: ,
    # - Exclamação: !
    # - Interrogação: ?
    # - Arroba: @
    # - E comercial: &
    # - Underscore: _
    # Tudo fora da lista (inclui –, —, ", ", •, emojis, etc.) é removido.
    nome = re.sub(r"[^\w\s()\[\]\-'.!,@&]", '', nome, flags=re.UNICODE)

    # Colapsa espaços/underscores múltiplos
    nome = re.sub(r' +', ' ', nome)
    nome = re.sub(r'_+', '_', nome)

    return nome.strip(' _')

def criarpastavideo(url):
    video = YouTube(url, on_progress_callback=on_progress)
    title = video.title
    print(f"TITLE:{title}", flush=True)
    pasta_nome = sanitizar_nome(f'Video - {title}')
    pasta_download = os.path.join(downloads_base, pasta_nome)
    os.makedirs(pasta_download, exist_ok=True)
    
    thumb_path = os.path.join(pasta_download, 'thumbnail.jpg')
    if hasattr(video, 'thumbnail_url') and video.thumbnail_url:
        try:
            req = urllib.request.Request(video.thumbnail_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response, open(thumb_path, 'wb') as out_file:
                out_file.write(response.read())
            print(f"THUMBNAIL:{os.path.join(pasta_nome, 'thumbnail.jpg')}", flush=True)
        except Exception as e:
            pass
            
    return pasta_download, title, video

def combinar_video_audio(video_path, audio_path, output_path, ffmpeg_path):
    print("STATUS:Combinando áudio e vídeo...", flush=True)
    comando = [
        ffmpeg_path, '-y',
        '-i', video_path,
        '-i', audio_path,
        '-c:v', 'copy',
        '-c:a', 'aac',
        '-strict', 'experimental',
        output_path
    ]
    subprocess.run(comando, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    os.remove(video_path)
    os.remove(audio_path)
    return output_path

def converter_audio(audio_path, output_path, ffmpeg_path, formato):
    print(f"STATUS:Convertendo para {formato.upper()}...", flush=True)
    codec = 'libmp3lame' if formato == 'mp3' else 'libopus'
    comando = [
        ffmpeg_path, '-y',
        '-i', audio_path,
        '-c:a', codec,
        '-q:a', '0' if formato == 'mp3' else '10',
        output_path
    ]
    if formato == 'opus':
        comando = [ffmpeg_path, '-y', '-i', audio_path, '-c:a', 'libopus', '-b:a', '160k', output_path]
    subprocess.run(comando, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    os.remove(audio_path)
    return output_path

def baixar(video, title, pasta, ffmpeg_path, formato):
    print("STATUS:Buscando melhor qualidade...", flush=True)
    title_safe = sanitizar_nome(title)
    final_output = ""

    if formato == "video":
        video2 = video.streams.filter(file_extension='mp4', only_video=True).order_by('resolution').desc().first()
        audio = video.streams.filter(only_audio=True).order_by('abr').desc().first()
        
        print("STATUS:Baixando vídeo...", flush=True)
        local_video = video2.download(filename=f'{title_safe}_video.mp4', output_path=pasta)
        
        print("STATUS:Baixando áudio...", flush=True)
        local_audio = audio.download(filename=f'{title_safe}_audio.mp3', output_path=pasta)

        final_output = os.path.join(pasta, f'{title_safe}.mp4')
        combinar_video_audio(local_video, local_audio, final_output, ffmpeg_path)
    
    elif formato in ["mp3", "opus"]:
        audio = video.streams.filter(only_audio=True).order_by('abr').desc().first()
        print("STATUS:Baixando áudio...", flush=True)
        local_audio = audio.download(filename=f'{title_safe}_audio_original.mp4', output_path=pasta)
        
        final_output = os.path.join(pasta, f'{title_safe}.{formato}')
        converter_audio(local_audio, final_output, ffmpeg_path, formato)
    
    abs_output = os.path.abspath(final_output)
    print(f"DONE:{abs_output}", flush=True)

ffmpeg_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'ffmpeg.exe')

try:
    pasta, title, video = criarpastavideo(url)
    baixar(video, title, pasta, ffmpeg_path, formato)
except Exception as e:
    print(f"ERROR:{str(e)}", flush=True)
