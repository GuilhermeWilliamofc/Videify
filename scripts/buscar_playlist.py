import sys
import json
import re
from pytubefix import Playlist
from pytubefix.exceptions import RegexMatchError
import socket

# Timeout para operações de rede (5 minutos para buscar playlist)
socket.setdefaulttimeout(300)

def validar_url_playlist(url):
    """Valida se a URL é de uma playlist do YouTube"""
    if not url or not isinstance(url, str):
        return False
    
    # Padrões de URL de playlist do YouTube
    playlist_patterns = [
        r'youtube\.com/playlist\?list=',
        r'youtube\.com/watch\?.*list=',
        r'youtu\.be/.*\?.*list='
    ]
    
    return any(re.search(pattern, url) for pattern in playlist_patterns)

def buscar_info_playlist(url):
    """Busca informações de todos os vídeos da playlist"""
    try:
        if not validar_url_playlist(url):
            print(json.dumps({
                "success": False,
                "error": "URL inválida. Certifique-se de usar uma URL de playlist do YouTube.",
                "error_type": "INVALID_URL"
            }), flush=True)
            sys.exit(1)
        
        print(json.dumps({
            "status": "Carregando playlist..."
        }), flush=True)
        
        playlist = Playlist(url)
        
        print(json.dumps({
            "status": f"Buscando informações de {len(playlist.video_urls)} vídeos..."
        }), flush=True)
        
        videos = []
        erros = []
        
        for idx, video_url in enumerate(playlist.video_urls, 1):
            try:
                print(json.dumps({
                    "progress": int((idx / len(playlist.video_urls)) * 100),
                    "status": f"Processando vídeo {idx}/{len(playlist.video_urls)}..."
                }), flush=True)
                
                from pytubefix import YouTube
                yt = YouTube(video_url)
                
                # Busca a melhor thumbnail disponível
                thumbnail_url = yt.thumbnail_url
                
                videos.append({
                    "url": video_url,
                    "title": yt.title,
                    "duration": yt.length,
                    "thumbnail": thumbnail_url,
                    "channel": yt.author,
                    "views": getattr(yt, 'views', 0)
                })
                
            except Exception as e:
                # Registra erro mas continua com outros vídeos
                erros.append({
                    "url": video_url,
                    "error": str(e),
                    "index": idx
                })
                print(json.dumps({
                    "warning": f"Erro ao processar vídeo {idx}: {str(e)}"
                }), flush=True)
        
        # Resultado final
        resultado = {
            "success": True,
            "playlist_title": playlist.title if hasattr(playlist, 'title') else "Playlist do YouTube",
            "total_videos": len(playlist.video_urls),
            "videos_processados": len(videos),
            "videos": videos,
            "errors": erros
        }
        
        print(json.dumps(resultado), flush=True)
        
    except RegexMatchError:
        print(json.dumps({
            "success": False,
            "error": "URL de playlist inválida ou malformada.",
            "error_type": "INVALID_PLAYLIST_URL"
        }), flush=True)
        sys.exit(1)
        
    except (socket.timeout, Exception) as e:
        error_msg = str(e).lower()
        
        if "bot" in error_msg or "po_token" in error_msg:
            print(json.dumps({
                "success": False,
                "error": "O YouTube detectou acesso automatizado. Aguarde alguns minutos e tente novamente.",
                "error_type": "BOT_DETECTION"
            }), flush=True)
        elif "timeout" in error_msg or isinstance(e, socket.timeout):
            print(json.dumps({
                "success": False,
                "error": "Timeout ao buscar playlist. Verifique sua conexão e tente novamente.",
                "error_type": "TIMEOUT"
            }), flush=True)
        elif "private" in error_msg:
            print(json.dumps({
                "success": False,
                "error": "Esta playlist é privada e não pode ser acessada.",
                "error_type": "PRIVATE_PLAYLIST"
            }), flush=True)
        else:
            print(json.dumps({
                "success": False,
                "error": f"Erro ao buscar playlist: {str(e)}",
                "error_type": "UNKNOWN"
            }), flush=True)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "error": "URL da playlist não fornecida",
            "error_type": "MISSING_URL"
        }), flush=True)
        sys.exit(1)
    
    url = sys.argv[1]
    buscar_info_playlist(url)
