import sys
import os
import re
import unicodedata
import pytubefix
from pytubefix import YouTube
from pytubefix.exceptions import (
    VideoUnavailable, 
    RegexMatchError, 
    VideoPrivate,
    RecordingUnavailable,
    MembersOnly,
    VideoRegionBlocked,
    LiveStreamError,
    AgeRestrictedError
)
import subprocess
import urllib.request
import socket
import time

url = sys.argv[1]
formato = sys.argv[2] if len(sys.argv) > 2 else "video"
# Pasta de destino passada pelo servidor Node.js (o DOWNLOADS_DIR persistente)
downloads_base = sys.argv[3] if len(sys.argv) > 3 else "Downloads"

# Timeout para operações de rede (30 minutos)
socket.setdefaulttimeout(1800)

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

def criarpastavideo(url, max_retries=3):
    """Cria pasta para vídeo com tratamento robusto de erros"""
    retry_count = 0
    last_error = None
    
    while retry_count < max_retries:
        try:
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
                    with urllib.request.urlopen(req, timeout=30) as response, open(thumb_path, 'wb') as out_file:
                        out_file.write(response.read())
                    print(f"THUMBNAIL:{os.path.join(pasta_nome, 'thumbnail.jpg')}", flush=True)
                except Exception as e:
                    print(f"STATUS:Aviso: Não foi possível baixar thumbnail", flush=True)
                    
            return pasta_download, title, video
            
        except VideoUnavailable:
            print("ERROR_TYPE:VIDEO_UNAVAILABLE", flush=True)
            print("ERROR:Este vídeo não está disponível. Pode estar privado, deletado ou indisponível no momento.", flush=True)
            sys.exit(1)
            
        except VideoPrivate:
            print("ERROR_TYPE:VIDEO_PRIVATE", flush=True)
            print("ERROR:Este vídeo é privado e não pode ser baixado.", flush=True)
            sys.exit(1)
            
        except MembersOnly:
            print("ERROR_TYPE:MEMBERS_ONLY", flush=True)
            print("ERROR:Este vídeo é exclusivo para membros do canal e não pode ser baixado.", flush=True)
            sys.exit(1)
            
        except VideoRegionBlocked:
            print("ERROR_TYPE:REGION_BLOCKED", flush=True)
            print("ERROR:Este vídeo está bloqueado na sua região geográfica.", flush=True)
            sys.exit(1)
            
        except AgeRestrictedError:
            print("ERROR_TYPE:AGE_RESTRICTED", flush=True)
            print("ERROR:Este vídeo possui restrição de idade. Tente usar um método alternativo ou faça login no YouTube.", flush=True)
            sys.exit(1)
            
        except LiveStreamError:
            print("ERROR_TYPE:LIVE_STREAM", flush=True)
            print("ERROR:Transmissões ao vivo não podem ser baixadas enquanto estão ativas. Aguarde o fim da live.", flush=True)
            sys.exit(1)
            
        except RegexMatchError:
            print("ERROR_TYPE:INVALID_URL", flush=True)
            print("ERROR:URL inválida. Certifique-se de usar uma URL válida do YouTube.", flush=True)
            sys.exit(1)
            
        except (socket.timeout, urllib.error.URLError) as e:
            retry_count += 1
            last_error = e
            if retry_count < max_retries:
                wait_time = retry_count * 2
                print(f"STATUS:Erro de conexão. Tentando novamente em {wait_time}s... (tentativa {retry_count}/{max_retries})", flush=True)
                time.sleep(wait_time)
            else:
                print("ERROR_TYPE:NETWORK_ERROR", flush=True)
                print(f"ERROR:Erro de conexão após {max_retries} tentativas. Verifique sua internet e tente novamente.", flush=True)
                sys.exit(1)
                
        except Exception as e:
            error_msg = str(e).lower()
            
            # Detecta erro de bot
            if "bot" in error_msg or "po_token" in error_msg:
                print("ERROR_TYPE:BOT_DETECTION", flush=True)
                print("ERROR:O YouTube detectou este download como bot. Isso acontece frequentemente com vídeos populares. Soluções: 1) Aguarde alguns minutos e tente novamente, 2) Tente com um vídeo diferente, 3) Para solução avançada, consulte: https://pytubefix.readthedocs.io/en/latest/user/po_token.html", flush=True)
                sys.exit(1)
            
            # Detecta mudanças na API
            elif "signature" in error_msg or "cipher" in error_msg or "extract" in error_msg:
                print("ERROR_TYPE:API_CHANGED", flush=True)
                print("ERROR:A API do YouTube foi alterada. Por favor, atualize o pytubefix: pip install --upgrade pytubefix", flush=True)
                sys.exit(1)
            
            # Erro genérico com retry
            else:
                retry_count += 1
                last_error = e
                if retry_count < max_retries:
                    wait_time = retry_count * 2
                    print(f"STATUS:Erro inesperado. Tentando novamente em {wait_time}s... (tentativa {retry_count}/{max_retries})", flush=True)
                    time.sleep(wait_time)
                else:
                    print("ERROR_TYPE:UNKNOWN", flush=True)
                    print(f"ERROR:Erro inesperado: {str(e)}", flush=True)
                    sys.exit(1)

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
    """Baixa vídeo/áudio com tratamento de erros de formato"""
    try:
        print("STATUS:Buscando melhor qualidade...", flush=True)
        title_safe = sanitizar_nome(title)
        final_output = ""

        if formato == "video":
            video2 = video.streams.filter(file_extension='mp4', only_video=True).order_by('resolution').desc().first()
            audio = video.streams.filter(only_audio=True).order_by('abr').desc().first()
            
            if not video2:
                print("ERROR_TYPE:FORMAT_UNAVAILABLE", flush=True)
                print("ERROR:Nenhum stream de vídeo MP4 disponível para este vídeo.", flush=True)
                sys.exit(1)
            
            if not audio:
                print("ERROR_TYPE:FORMAT_UNAVAILABLE", flush=True)
                print("ERROR:Nenhum stream de áudio disponível para este vídeo.", flush=True)
                sys.exit(1)
            
            print("STATUS:Baixando vídeo...", flush=True)
            local_video = video2.download(filename=f'{title_safe}_video.mp4', output_path=pasta)
            
            print("STATUS:Baixando áudio...", flush=True)
            local_audio = audio.download(filename=f'{title_safe}_audio.mp3', output_path=pasta)

            final_output = os.path.join(pasta, f'{title_safe}.mp4')
            combinar_video_audio(local_video, local_audio, final_output, ffmpeg_path)
        
        elif formato in ["mp3", "opus"]:
            audio = video.streams.filter(only_audio=True).order_by('abr').desc().first()
            
            if not audio:
                print("ERROR_TYPE:FORMAT_UNAVAILABLE", flush=True)
                print("ERROR:Nenhum stream de áudio disponível para este vídeo.", flush=True)
                sys.exit(1)
            
            print("STATUS:Baixando áudio...", flush=True)
            local_audio = audio.download(filename=f'{title_safe}_audio_original.mp4', output_path=pasta)
            
            final_output = os.path.join(pasta, f'{title_safe}.{formato}')
            converter_audio(local_audio, final_output, ffmpeg_path, formato)
        
        abs_output = os.path.abspath(final_output)
        print(f"DONE:{abs_output}", flush=True)
        
    except PermissionError:
        print("ERROR_TYPE:PERMISSION_DENIED", flush=True)
        print("ERROR:Sem permissão para salvar o arquivo. Verifique se a pasta de destino não está protegida ou se o arquivo não está aberto em outro programa.", flush=True)
        sys.exit(1)
        
    except OSError as e:
        if "space" in str(e).lower():
            print("ERROR_TYPE:DISK_FULL", flush=True)
            print("ERROR:Espaço insuficiente no disco. Libere espaço e tente novamente.", flush=True)
        else:
            print("ERROR_TYPE:FILE_SYSTEM_ERROR", flush=True)
            print(f"ERROR:Erro ao salvar arquivo: {str(e)}", flush=True)
        sys.exit(1)
        
    except subprocess.CalledProcessError as e:
        print("ERROR_TYPE:FFMPEG_ERROR", flush=True)
        print("ERROR:Erro ao processar o vídeo/áudio com FFmpeg. O arquivo pode estar corrompido.", flush=True)
        sys.exit(1)
        
    except Exception as e:
        print("ERROR_TYPE:DOWNLOAD_FAILED", flush=True)
        print(f"ERROR:Falha no download: {str(e)}", flush=True)
        sys.exit(1)

ffmpeg_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'ffmpeg.exe')

# Validação básica de URL
if not url or not isinstance(url, str):
    print("ERROR_TYPE:INVALID_INPUT", flush=True)
    print("ERROR:URL inválida ou não fornecida.", flush=True)
    sys.exit(1)

if not ("youtube.com" in url or "youtu.be" in url):
    print("ERROR_TYPE:INVALID_URL", flush=True)
    print("ERROR:Esta não parece ser uma URL válida do YouTube.", flush=True)
    sys.exit(1)

try:
    pasta, title, video = criarpastavideo(url)
    baixar(video, title, pasta, ffmpeg_path, formato)
except KeyboardInterrupt:
    print("ERROR_TYPE:CANCELLED", flush=True)
    print("ERROR:Download cancelado pelo usuário.", flush=True)
    sys.exit(1)
except Exception as e:
    # Captura qualquer erro não tratado
    error_msg = str(e)
    print("ERROR_TYPE:UNEXPECTED", flush=True)
    print(f"ERROR:Erro inesperado: {error_msg}", flush=True)
    sys.exit(1)
