//importing modules
var express = require( 'express' );
var request = require( 'request' );
var cheerio = require( 'cheerio' );

//creating a new express server
var app = express();

//setting EJS as the templating engine
app.set( 'view engine', 'ejs' );

//setting the 'assets' directory as our static assets dir (css, js, img, etc...)
app.use( '/assets', express.static( 'assets' ) );


//makes the server respond to the '/' route and serving the 'home.ejs' template in the 'views' directory
app.get( '/', function ( req, res ) {
    var URL = req.query.urlLBC

    if ( URL ) {
        callLeBonCoin( URL, res )
    }
    else {

        res.render( 'home', {
            estimation: 'Estimation du prix d'un bien
        });
    }
});


//launch the server on the 3000 port
app.listen( 3000, function () {
    console.log( 'App listening on port 3000!' );
});


function callLeBonCoin( _url, res ) {
    request( _url, function ( error, response, body ) {
        if ( !error && response.statusCode == 200 ) {
            var url = cheerio.load( body )
            var firstPrice = url( 'span.value' ).eq( 0 ).text()

            var price = url( 'span.value' ).eq( 0 ).text().replace( '€', '' )
            price = price.replace( / /g, "" )



            console.log( price )
            var Ville = url( 'span.value' ).eq( 1 ).text().split( ' ' )[0]
            var surf = url( 'span.value' ).eq( 4 ).text().split( ' ' )[0]
            var codeP = url( 'span.value' ).eq( 1 ).text().split( ' ' )[1]
            var type = url( 'span.value' ).eq( 2 ).text()
            console.log( surf )
            var prixm2 = price / surf
            console.log( prixm2 )


            request( 'http://www.meilleursagents.com/prix-immobilier/' + Ville.toLowerCase() + '-' + codeP, function ( error, response, body ) {
                if ( !error && response.statusCode == 200 ) {
                    var url2 = cheerio.load( body )
                    var prixAppart = url2( 'div.small-4.medium-2.columns.prices-summary__cell--median' ).eq( 0 ).text().replace( '€', '' ).replace( /\s/g, '' )
                    prixAppart = parseFloat( prixAppart )
                    var prixMaison = url2( 'div.small-4.medium-2.columns.prices-summary__cell--median' ).eq( 1 ).text().replace( '€', '' ).replace( /\s/g, '' )
                    var estimation = ' '
                    if ( type == 'Maison' ) {
                        if ( prixMaison < prixm2 ) {
                            estimation = 'Mauvais deal'
                        }
                        else {
                            estimation = 'bondeal deal'
                    }
                    else {
                        if ( prixMaison < prixm2 ) {
                            estimation = 'Mauvais deal'
                        }
                        else {
                            estimation = 'Bon deal'
                        }

                    }

                    res.render( 'home', {
                        estimation: estimation
                    });
                }
            })
        }
    })
}