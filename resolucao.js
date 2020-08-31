const fs = require('fs');

var brokendataname = 'broken-database.json';
var fixedataname = 'saida.json';

//ETAPA DE RECUPERAÇÃO DOS DADOS ORIGINAIS

//função que retorna um objeto com as informações de um json
function readJson(path) { 
    try {
        return JSON.parse(fs.readFileSync(path)); //ref: https://bit.ly/2YKRRow
    } 
    catch(err) {
        return 0; //arquivo não encontrado
    }
}

//função que substitui todas as ocorrências de caracteres corrompidos pelo caracteres corretos
function fixName(data) {
    for(i in data) {
        data[i].name = data[i].name.split('æ').join('a');
        data[i].name = data[i].name.split('¢').join('c');
        data[i].name = data[i].name.split('ø').join('o');
        data[i].name = data[i].name.split('ß').join('b');
    }
}

//função que transforma o campo preço para tipo number
function fixPrice(data) {
    for(i in data) { 
        if(typeof(data[i].price) != 'number') {
            data[i].price = parseFloat(data[i].price);
        }
    }
}

//função que insere o campo quantity (quantidade) igual a 0 onde o mesmo não existe
function fixQuantity(data) {
    for(i in data) {
        if(!data[i].hasOwnProperty('quantity')) {
            data[i].quantity = 0;
        }
    }
}

//função responsável por exportar os dados recuperados para um arquivo json
function exportJson(data, filename) {
    try {
        var json = JSON.stringify(data, null, 2); //transforma os dados em um json serializável, ref: https://bit.ly/2YKRRow
        fs.writeFileSync(filename, json);
        return 1 //Arquivo criado com sucesso
    }
    catch(err) {
        return 0 //Não foi possível criar o arquivo
    }
}

//lendo e guardando o banco de dados corrompido
var brokendata = readJson(brokendataname);

//caso a leitura dê certo, realizamos o conserto dos dados
if(brokendata != 0) {
    fixName(brokendata);
    fixPrice(brokendata);
    fixQuantity(brokendata);
    exportJson(brokendata, fixedataname);
}


//ETAPA DE VALIDAÇÃO DOS DADOS CORRIGIDOS

//função que ordena o banco de dados por categoria e id 
function sortData(data) {
    //ordenando primeiro por categoria
    data.sort((a, b) => {
        //ordenação case insensitive
        a = a.category.toLowerCase();
        b = b.category.toLowerCase();

        return (a < b) ? -1 : (a > b) ? 1 : 0; //retorna -1 para a < b, 1 para a > b e 0 para a = b
    });

    //ordenando os ids em ordem crescente de acordo com a categoria
    data.sort((a, b) => {
        if(a.category == b.category) {
            a = a.id;
            b = b.id;

            return (a < b) ? -1 : (a > b) ? 1 : 0; 
        }
    })

    //printando os nomes ordenados
    for(i in data) {
        console.log(data[i].name);
    }
}

//função que conta quantos produtos por categoria existem no estoque
function quantityByCategory(data) {
    var stock = [], stockIt = -1 //vetor de objetos que guarda o estoque por categoria e seu iterador
    var categoryBuffer = ''; //variável que guarda a categoria anterior ao iterador principal i
    for(i in data) {
        //pelo fato de que agora o banco está ordenado por categoria, não precisamos realizar dois loops para
        //identificar se a categoria existe no objeto stock e um para iterar o objeto data, basta identificar
        //quando a categoria muda, por isso o categoryBuffer é usado
        if(categoryBuffer != data[i].category) {
            stock.push({
                'category': data[i].category,
                'quantity': 0
            })
            stockIt++;
        }

        stock[stockIt].quantity += data[i].quantity; //somando a quantidade de produtos por categoria
        categoryBuffer = data[i].category; //atualizando o buffer de categoria para a proxima iteração
    }

    return stock;
}

//lendo e guardando o banco de dados restaurado
var fixedata = readJson(fixedataname);

//caso a leitura dê certo, realizamos a verificação dos dados
if(fixedata != 0) {
    sortData(fixedata);
    console.log(quantityByCategory(fixedata));
}