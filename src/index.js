const app = require('./app');
const port = process.env.PORT || 8000;

app.listen(port, ()=>{
    console.log(process.env.PUBLIC_JWT);
    console.log(`Server on porto ${port}`);
});

