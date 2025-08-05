import pickle
from js import document, Blob, URL, Uint8Array

def testepickle(event=None):
    print('testepickle chamado!')
    nome_digitado = document.getElementById('ititulo').value
    nome_arquivo = nome_digitado.replace(' ', '_')
    descricao_digitada = document.getElementById('idescricao').value
    dados_digitados = {'titulo': nome_digitado, 'descricao': descricao_digitada}

    dados_binarios = pickle.dumps(dados_digitados)
    # Converte para Uint8Array (necessário para binário real no Blob)
    array = Uint8Array.new(len(dados_binarios))
    for i, byte in enumerate(dados_binarios):
        array[i] = byte

    # Cria o Blob com dados binários reais
    blob = Blob.new([array], { "type": "application/octet-stream" })
    url = URL.createObjectURL(blob)

    # Cria link e força download
    link = document.createElement("a")
    link.href = url
    link.download = f"{nome_arquivo}.pkl"
    link.click()

    print(f'arquivo criado!\ntitulo: {nome_digitado}\ndescricao: {descricao_digitada}')