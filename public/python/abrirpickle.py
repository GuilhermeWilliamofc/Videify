import pickle

try:
    with open('gay.pkl', 'rb') as arquivo:
        dicionario = pickle.load(arquivo)
except Exception as erro:
    print(f'\033[31mErro ({erro}): Erro durante o Carregamento do Dicionário!\033[m')
else:
    print('\033[32mDicionário carregado com sucesso!\033[m')
    print(dicionario)