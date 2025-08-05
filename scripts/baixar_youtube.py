import sys
import os
import re
import pytubefix
import subprocess

url = sys.argv[1]

def criarpastavideo(url):
    video = pytubefix.YouTube(url)
    pasta_nome = re.sub(r'[<>:"/\\|?*]', '_', f'Video - {video.title}')
    pasta_download = os.path.join('Downloads - Baixador Youtube', pasta_nome)
    os.makedirs(pasta_download, exist_ok=True)
    return pasta_download

def combinar_video_audio(video_path, audio_path, output_path, ffmpeg_path):
    comando = [
        ffmpeg_path, '-y',
        '-i', video_path,
        '-i', audio_path,
        '-c:v', 'copy',
        '-c:a', 'aac',
        '-strict', 'experimental',
        output_path
    ]
    subprocess.run(comando, check=True)
    os.remove(video_path)
    os.remove(audio_path)

def baixarvideo(url, pasta, ffmpeg_path):
    video = pytubefix.YouTube(url)
    video2 = video.streams.filter(file_extension='mp4', only_video=True).order_by('resolution').desc().first()
    audio = video.streams.filter(only_audio=True).order_by('abr').desc().first()

    local_video = video2.download(filename=f'{video.title}_video.mp4', output_path=pasta)
    local_audio = audio.download(filename=f'{video.title}_audio.mp3', output_path=pasta)

    combinar_video_audio(
        local_video,
        local_audio,
        os.path.join(pasta, f'{video.title}.mp4'),
        ffmpeg_path
    )

ffmpeg_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'ffmpeg.exe')
pasta = criarpastavideo(url)
baixarvideo(url, pasta, ffmpeg_path)
