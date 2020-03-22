<?php

	return array(


		/**
		* Se o modo de depuração estiver definido como true, você poderá ver algumas informações de rastreamento e
		* localize erros mais facilmente.
		*
		* Nota: quando os erros forem resolvidos, defina-os como false, caso contrário o roBrowser não será
		* capaz de funcionar corretamente.
		*/
		'DEBUG'               =>     true,


		/**
		* Defina onde estão localizados os arquivos do cliente completo
		* Por padrão, ele está no diretório 'resources/', mas você pode atualizá-lo se precisar
		*
		* Nota: Os arquivos necessários neste diretório são DATA.INI e seus arquivos GRFs.
		* Todos os outros arquivos não serão lidos.
		*/
		'CLIENT_RESPATH'      =>    'resources/',


		/**
		 * Nome do arquivo DATA.INI
		 * Este arquivo é usado para conhecer os GRFs que o cliente remoto precisa carregar e o direito
		 * ordem para carregá-los.
		 *
		 * Nota: este nome de arquivo é sensitive e deve estar localizado na pasta 'resources/'
		 *
		 * Exemplo do conteúdo deste arquivo:
		 *
		 *	[Data]
		 *	0=custom.grf
		 *	1=rdata.grf
		 *	2=data.grf
		 */
		'CLIENT_DATAINI'      =>    'DATA.INI',


		/**
		* Se definido como true, os arquivos carregados dos GRFs serão extraídos para a pasta de dados
		* Isso evitará carregar GRFs sempre que o cliente solicitar um arquivo e
		* economize recursos do servidor.
		*
		* Nota: é necessário acesso de gravação à pasta de dados.
		 */
		'CLIENT_AUTOEXTRACT'  =>    false,


		/**
		* Ativamos o método post para recuperar informações sobre arquivos armazenados no GRF ?
		* É usado no Grf Viewer para listar arquivos de um repertorie ou para pesquisar arquivos.
		*
		* Se você não usar o Grf Viewer, Model Viewer, Map Viewer e Str Viewer,
		* pode simplesmente desativar esse recurso.
		 */
		'CLIENT_ENABLESEARCH' =>    false,
	);