// Exported app so that we can import it into testing files
const app = require('./index');

app.listen(3001, () => {
    console.log('server up on port 3001');
});