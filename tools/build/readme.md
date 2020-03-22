Compilando scripts
=================

O roBrowser contém centenas de arquivos, carregando-os em um servidor de produção, demorado demais.
Esse diretório ajudará a mesclar todos os arquivos do projeto por um novo, otimizado e compactado.

###Utilization###

Abra o arquivo *"index.html"* no seu navegador e **select the Application** você quer compilar (*Online*, *GrfViewer*, *ModelViewer*, *MapViewer*, *Thread*).

Após a compilação, você pode salvar o arquivo gerado no local especificado.

**Nota: Todas as aplicações exigiam o *Thread* aplicativo compilado.**

###Configure roBrowser###

Para usar a versão compilada do roBrowser, vá para o seu objeto de configuração (called *ROConfig*) e defina o parâmetro *development* to **false**.