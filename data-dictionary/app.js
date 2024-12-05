const express = require('express');
const fs = require('fs');
const app = express();

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.static('public'));

const metadataPath = './data/metadata.json';

app.get('/', (req, res) => {
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  res.render('index', { tables: Object.keys(metadata), metadata });
});

app.get('/table/:tableName', (req, res) => {
  const tableName = req.params.tableName;
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  const table = metadata[tableName];

  if (!table) {
    res.status(404).send('Tabela não encontrada');
    return;
  }

  // Relacionamentos: Identificar relações baseadas nos metadados
  const relationships = table.relations || [];

  res.render('table', { tableName, table, relationships });
});

app.get('/relationships', (req, res) => {
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  res.render('relationships', { metadata });
});


app.post('/edit', (req, res) => {
  const { tableName, column, description } = req.body;
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

  if (metadata[tableName] && metadata[tableName].columns[column]) {
    metadata[tableName].columns[column] = description;
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    return res.status(200).send('Atualizado com sucesso');
  }
  res.status(400).send('Erro ao atualizar');
});

app.listen(4000, () => console.log('App disponível em http://localhost:4000'));
