[Tradução](https://www.robrowser.com/getting-started#API)
#### Instalação 

````
Este documento explica como baixar e instalar o roBrowser no seu site ou como um aplicativo Chrome e explica como os usuários poderão usá-lo.
````

````
Nota: o roBrowser é apenas um executável; portanto, para executá-lo, você precisará dos arquivos originais do cliente e de um servidor para executar o jogo. Você pode encontrar todos eles em fóruns como rAthena.org ou Hercules.ws. 
````

### Obter o código fonte

Primeiro de tudo, para rodar o roBrowser você precisa [baixar](https://github.com/vthibault/roBrowser/archive/master.zip) o código fonte. 

**Foi adicionado em 'archive/master.zip' dia 22/03/2020**

O projeto é compactado em um arquivo zip. Você precisará de um descompactador ZIP para extrair seu conteúdo. Você pode pesquisar no Google se o seu sistema não tiver um instalado.

#### Instalando um cliente remoto

O Cliente Remoto é usado para baixar recursos do jogo de um servidor quando os usuários não têm um FullClient no computador.

Em vez de extrair seus GRFs em um diretório de dados e carregá-los em um servidor, o Cliente Remoto possui algumas capacidades poderosas:


   1. *O cliente de outro domínio pode baixar recursos do seu servidor (configurável).*
   2. *Extraindo arquivos diretamente dos arquivos de recursos do jogo.*
   3. *Convertendo arquivos BMP em PNG para acelerar o download.*
   4. *Extração automática de arquivos do seu GRF para economizar recursos do servidor.*

#### Upload

O RemoteClient está localizado no diretório **client /**. Faça o upload para o seu servidor da web e adicione:


   1. Seus arquivos GRFs e DATA.INI diretamente na pasta **resources/**.
   2. Adicione seus arquivos mp3 na pasta **BGM/**
   3. Adicione o conteúdo dos seus **data/** pasta na pa do cliente.

#### Configuration

Uma vez feito, você precisará apenas configurar o arquivo **configs.php**  e **.htaccess** .

O **htaccess** precisará conhecer o caminho onde está localizado **index.php** para trabalhar com a reescrita de URL

**type: myroserver.com/client/**
````
   ErrorDocument 404 /client/index.php
````

**type: myroserver.com/low/client/**
````
   ErrorDocument 404 /low/client/index.php
````

**type: client.myroserver.com/**
````
   ErrorDocument 404 /index.php
````

#### Adding your customs

Desde algumas revisões, o roBrowser não lê mais arquivos de dados (lua, xray, .txt). Para evitar problemas, você precisará convertê-los e adicioná-los diretamente ao código-fonte do roBrowser.

![converter](https://static.robrowser.com/converter.jpg)

Para fazer isso, vá para **tools/converter/index.html** e selecione o tipo de dados que você precisa compilar e o tipo de arquivo.
Arraste os arquivos para o navegador e clique em **Convert**. Salve o arquivo no local especificado.


#### Compile roBrowser source code

Se não estiver sendo executado no modo de [desenvolvimento](https://www.robrowser.com/getting-started#Development), o código deverá ser compilado: o player não deseja baixar ~ 150 arquivos javascript para reproduzir o RO ...

Para compilar o roBrower, abra o arquivo **tools/build/index.html** no seu navegador da web, selecione o aplicativo necessário.

![Compile](https://static.robrowser.com/build.jpg)

O processo pode demorar algumas vezes, uma vez concluído, observe o local em que o arquivo deve ser salvo, faça o download do arquivo e mova-o para esse local.

Nota: todos os aplicativos usam o aplicativo **Thread**, portanto, não esqueça de compilá-lo também.


#### Configure to run in a website

Se você deseja que o roBrowser esteja acessível em um site, basta seguir o guia da [API](https://www.robrowser.com/getting-started#API).
Você poderá criar uma página com suas próprias configurações para permitir que seus jogadores acessem o roBrowser no seu site, diretamente em uma div ou abrindo um pop-up.


## Configure to use as a Chrome App 

#### What is a Chrome APP ?

Chrome App é o nome do aplicativo Google Chrome. É exatamente o mesmo que executar um site diretamente, exceto que você tem um ícone do aplicativo em algum lugar no navegador Google Chrome.

A principal razão pela qual decidi portar o roBrowser para o Chrome App é beneficiar alguns privilégios, podendo executar soquetes nativos sem depender de um plug-in como JAVA

#### Configuration

É possível adicionar a configuração padrão ao aplicativo, basta abrir **applications/settings.js** e adicionar seus próprios parâmetros (os mesmos parâmetros usados na [API](https://www.robrowser.com/getting-started#API))

#### Installation

Vá para a página de gerenciamento de extensões clicando no ícone de configurações e escolhendo **Tools > Extensions** ou acessando este **URL: chrome://extensions/** na sua omnibox mais [informações](https://developer.chrome.com/apps/first_app#load).

Verifique se a caixa de seleção **Developer mode** foi marcada.

Se você deseja depurar o roBrowser, clique no botão **Load unpacked extension**, navegue até a pasta principal do roBrowser e clique em **OK**.

Se você deseja criar o aplicativo, clique no botão **Pack extension**, navegue até o diretório principal do roBrowser e clique em **Package**. Ele criará dois arquivos, um .pem e um .crx necessários para publicar seu aplicativo mais [informações](https://developer.chrome.com/extensions/packaging.html).

Quando terminar, basta clicar no aplicativo criado para executar o roBrowser.