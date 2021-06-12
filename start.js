// Exported app so that we can import it into testing files
const app = require('./index');

const port = process.env.PORT || 3001

app.listen(port, () => {
    console.log(`Server up on port ${port}`);
});