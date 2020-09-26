//Install express server
const express = require('express');
const path = require('path');

const app = express();

// da bi meta tagovi bili pri renderovani...
// app.use(require('prerender-node'));

// Serve only the static files form the dist directory
app.use(express.static('./dist/ng-myAnime'));

app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, '/dist/ng-myAnime/index.html'));
});

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080, () =>
  console.log(`server Server running on port ${process.env.PORT}`)
);
