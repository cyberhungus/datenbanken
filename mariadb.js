const express = require('express')

const mariadb = require('mariadb');

const pug = require('pug');



const pool = mariadb.createPool({
    host: 'localhost',
    port: 13064,
    user:'master',
    password: 'password',
    database: 'schule'
});

async function newQuery( query ){
    let conn;
    var result = '';
    try {
        conn = await pool.getConnection();
        result = await conn.query(query);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
    return result;
};



const app = express()
const port = 4000;

app.use(express.static(__dirname + '/static'));

// app.get('/tables', async (req, res) => {
//     var result = await newQuery('show tables');
//     res.send((pug.renderFile('pugs/template.pug', {
//         result: result
//     })));
// });
//
// app.get('/lehrernachfach', async (req, res) => {
//     var result = await newQuery('show tables');
//     res.send((pug.renderFile('pugs/template.pug', {
//         result: (pug.renderFile('pugs/lehrernachfach.pug', {
//             result: result ,
//         }))
//     })));
// });



app.get('/teacherquery', async (req, res) => {
//"select * from lehrkraft where kernfach = 'Bio' or nebenfach='Bio'"
    var query = "select * from lehrkraft where kernfach = "+"'"+req.query.sqlquery+"'"+" or nebenfach="+"'"+req.query.sqlquery+"'";
    console.log("teacher query")
    console.log(req.query.sqlquery)
    console.log(query)
    var result = await newQuery(query);
    res.send((pug.renderFile('pugs/template.pug', {
        result: (pug.renderFile('pugs/lehrernachfach.pug', {
            result: result,
        }))
    })))
});

app.get('/bookquery', async (req, res) => {
//SELECT Name,Vornamen,Titel FROM buch join schüler WHERE Titel = "Home Alone 2: Lost in New York" AND AusgeliehenSchülerID = SchülerID
    var query = "SELECT Name,Vornamen,Titel FROM buch join schüler WHERE Titel LIKE '%"+req.query.sqlquery+"%' AND AusgeliehenSchülerID = SchülerID"
    console.log("teacher query")
    console.log(req.query.sqlquery)
    console.log(query)
    var result = await newQuery(query);
    res.send((pug.renderFile('pugs/template.pug', {
        result: (pug.renderFile('pugs/buchnachtitel.pug', {
            result: result,
        }))
    })))
});
//wirft bei unsachgemäßer suche einen err aus "Cannot convert undefined or null to object"
app.get('/mascotquery', async (req, res) => {

   // SELECT klasse.KlassenName, maskottchen.Name, maskottchen.Spezies  FROM maskottchen JOIN klasse ON klasse.KlassenID = maskottchen.MaskottchenKlassenID AND klasse.KlassenName = '"+req.query.sqlquery+"' ORDER BY KlassenName


    var query =  "SELECT klasse.KlassenName, maskottchen.Name, maskottchen.Spezies  FROM maskottchen JOIN klasse ON klasse.KlassenID = maskottchen.MaskottchenKlassenID AND klasse.KlassenName = '"+req.query.sqlquery+"' ORDER BY KlassenName"

    console.log(req.query.sqlquery)
    console.log(query)
    var result = await newQuery(query);
    res.send((pug.renderFile('pugs/template.pug', {
        result: (pug.renderFile('pugs/maskottchennachklasse.pug', {
            result: result,
        }))
    })))
});

app.get('/courseclassteacherquery', async (req, res) => {
//pro eingegebener klasse werden die KursIDS fachnacmen, klassennamen, lehrkraft name und fächer ausgegeben
    var query =  "SELECT distinct kursproklasse.RelKursID, kurs.Fach, klasse.KlassenName, lehrkraft.Name, lehrkraft.Kernfach, lehrkraft.Nebenfach FROM kursproklasse JOIN klasse ON kursproklasse.RelKlasseID = klasse.KlassenID AND klasse.KlassenName = '"+req.query.sqlquery+"' LEFT JOIN kurs ON kursproklasse.RelKursID = kurs.KursID left JOIN lehrkraftprokurs ON kursproklasse.RelKursID = lehrkraftprokurs.RelKursID left JOIN lehrkraft ON lehrkraftprokurs.RelLehrkraftID = lehrkraft.LehrkraftID"
    console.log(req.query.sqlquery)
    console.log(query)
    var result = await newQuery(query);
    res.send((pug.renderFile('pugs/template.pug', {
        result: (pug.renderFile('pugs/lehrernachkursundklasse.pug', {
            result: result,
        }))
    })))
});

app.get('/courseteacher', async (req, res) => {
//pro eingegebener klasse werden die KursIDS fachnacmen, klassennamen, lehrkraft name und fächer ausgegeben
    var query =  "SELECT kurs.KursID, kurs.Fach, lehrkraft.LehrkraftID, lehrkraft.Name, lehrkraft.Kernfach, lehrkraft.Nebenfach FROM lehrkraftprokurs JOIN lehrkraft ON lehrkraftprokurs.RelLehrkraftID=lehrkraft.LehrkraftID JOIN kurs ON lehrkraftprokurs.RelKursID = kurs.KursID AND kurs.Fach='"+req.query.sqlquery+"'"
    console.log(req.query.sqlquery)
    console.log(query)
    var result = await newQuery(query);
    res.send((pug.renderFile('pugs/template.pug', {
        result: (pug.renderFile('pugs/kurseprolehrer.pug', {
            result: result,
        }))
    })))
});

app.get('/classteacher', async (req, res) => {
//pro eingegebener klasse werden die KursIDS fachnacmen, klassennamen, lehrkraft name und fächer ausgegeben
    var query = " SELECT klasse.KlassenName, lehrkraft.Name, lehrkraft.Vorname FROM klasse JOIN lehrkraft ON klasse.`KlassenlehrerID` = lehrkraft.LehrkraftID AND klasse.KlassenName = '"+req.query.sqlquery+"'"
    console.log(req.query.sqlquery)
    console.log(query)
    var result = await newQuery(query);
    res.send((pug.renderFile('pugs/template.pug', {
        result: (pug.renderFile('pugs/klassenlehrer.pug', {
            result: result,
        }))
    })))
});

app.get('/studentsinclass', async (req, res) => {
//pro eingegebener klasse werden die KursIDS fachnacmen, klassennamen, lehrkraft name und fächer ausgegeben
    var query = " SELECT klasse.KlassenName, schüler.SchülerID, schüler.Name, schüler.Vornamen FROM schüler JOIN klasse ON schüler.SchülerKlassenID = klasse.KlassenID AND klasse.KlassenName = '"+req.query.sqlquery+"'"
    console.log(req.query.sqlquery)
    console.log(query)
    var result = await newQuery(query);
    res.send((pug.renderFile('pugs/template.pug', {
        result: (pug.renderFile('pugs/schulerproklasse.pug', {
            result: result,
        }))
    })))
});

app.get('/studentsinclasscount', async (req, res) => {
//pro eingegebener klasse werden die KursIDS fachnacmen, klassennamen, lehrkraft name und fächer ausgegeben
    var query = " Select COUNT(Schüler.`SchülerID`) AS \"Anzahl Schüler\" FROM schüler join klasse ON schüler.`SchülerKlassenID` = klasse.KlassenID AND klasse.KlassenName = '"+req.query.sqlquery+"'"
    console.log(req.query.sqlquery)
    console.log(query)
    var result = await newQuery(query);
    console.log(result)
    res.send((pug.renderFile('pugs/template.pug', {
        result: (pug.renderFile('pugs/schulercount.pug', {
            result: result,
        }))
    })))
});


app.get('/roompersubject', async (req, res) => {
//pro eingegebener klasse werden die KursIDS fachnacmen, klassennamen, lehrkraft name und fächer ausgegeben
    var query = " SELECT raum.RaumNR, raum.`Sitzplätze`, raum.RaumName, kurs.KursID, kurs.Fach FROM kurs JOIN raum ON kurs.KursRaumNr = raum.RaumNR AND kurs.Fach ='"+req.query.sqlquery+"'"
    console.log(req.query.sqlquery)
    console.log(query)
    var result = await newQuery(query);
    console.log(result)
    res.send((pug.renderFile('pugs/template.pug', {
        result: (pug.renderFile('pugs/raumnachFach.pug', {
            result: result,
        }))
    })))
});

app.get('/classleader', async (req, res) => {
//pro eingegebener klasse werden die KursIDS fachnacmen, klassennamen, lehrkraft name und fächer ausgegeben
    var query = "SELECT klasse.KlassensprecherID, schüler.Name, schüler.Vornamen FROM klasse" + " JOIN schüler ON klasse.KlassensprecherID = schüler.`SchülerID` AND klasse.KlassenName = '"+req.query.sqlquery+"'"
    console.log(req.query.sqlquery)
    console.log(query)
    var result = await newQuery(query);
    console.log(result)
    res.send((pug.renderFile('pugs/template.pug', {
        result: (pug.renderFile('pugs/klassensprecher.pug', {
            result: result,
        }))
    })))
});

app.get('/studentsbyage', async (req, res) => {
//pro eingegebener klasse werden die KursIDS fachnacmen, klassennamen, lehrkraft name und fächer ausgegeben
    var query = "SELECT schüler.`SchülerID`,schüler.Name, schüler.Vornamen,(ROUND((DATEDIFF(CURDATE(),schüler.Geburtstag)/365))) AS 'Alter', klasse.KlassenName  FROM schüler JOIN klasse ON klasse.KlassenID = schüler.`SchülerKlassenID` AND (ROUND((DATEDIFF(CURDATE(),schüler.Geburtstag)/365))) ='"+req.query.sqlquery+"'"

    console.log(req.query.sqlquery)
    console.log(query)
    var result = await newQuery(query);
    console.log(result)
    res.send((pug.renderFile('pugs/template.pug', {
        result: (pug.renderFile('pugs/schulernachalter.pug', {
            result: result,
        }))
    })))
});

app.get('/bookinsert', async (req, res) => {
//erstellt ein neues buch mit fortlaufender id
    var query = "SELECT MAX(buchID) AS largestID FROM buch"
    console.log(query)
    var largestnumber = await newQuery(query);
    var largestnumberstring = JSON.stringify(largestnumber).split(":")
    largestnumberstring = largestnumberstring[1].split("}");
    largestnumberstring = largestnumberstring[0];
    var largestnumberint = 1;
    largestnumberint=parseInt(largestnumberstring,10)
    largestnumberint+=1;
    console.log(largestnumberstring)
    console.log(largestnumberint)
   var insertquery = "INSERT INTO buch (BuchID, Autor, ISBN, Titel, AusgeliehenSchülerID) VALUES ("+largestnumberint+",'"+req.query.Autor+"','"+req.query.ISBN+"','"+req.query.Titel+"',"+Math.round((Math.random()*2000)+2000)+")"
   var insertresult = await newQuery(insertquery);
   console.log(insertquery)
    var finalquery = "SELECT * FROM buch WHERE buchID =" +largestnumberint
    var result = await newQuery(finalquery);


    res.send((pug.renderFile('pugs/template.pug', {
        result: (pug.renderFile('pugs/bucherstellt.pug', {
            result: result,
        }))
    })))
});



app.get('/', async (req, res) => {

    res.send((pug.renderFile('pugs/template.pug', {
    })));
});

app.listen(port, () => console.log(`Server läuft auf localhost:${port}`));

