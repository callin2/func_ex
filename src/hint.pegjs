//  pegjs --allowed-start-rules HintLine,Query  hint.pegjs

{
  var hints = {}
  var queryType = ''
}


Query = Comments? S? ( SQL / CYPHER )?  { return {hints, queryType} }

Comments = ( HintLine / CommentLine )*

SQL     = "select"i S+ .*    { queryType='sql' }
CYPHER  = "match"i S+ .*     { queryType='cypher' }

HintLine  =  LineCommentBegin  [^@]* "@" htype:HintType  hbody:HintBody  { hints[htype] = ({type:htype, body:hbody}); }
CommentLine = LineCommentBegin  [^\n]*  { console.log('comment found')}

LineCommentBegin  = S? "--"

HintType = Id { return text(); }

HintBody = JSON {return JSON.parse(text()); }

Id = ([_\$A-Za-z][_\$0-9A-Za-z]*) { return text(); }



JSON = S? ( Object / Array / String / True / False / Null / Number ) S?

Object = "{"
             ( String ":" JSON ( "," String ":" JSON )*
             / S? )
         "}"  { return JSON.parse(text()); }

Array = "["
            ( JSON ( "," JSON )*
            / S? )
        "]"

String = S? ["] ( Escape / [^"\u0000-\u001F] )* ["] S?

Escape = [\\] ( ["] / [/] / [\] / [b] / [f] / [n] / [r] / [t] / UnicodeEscape )

UnicodeEscape = "u" [0-9A-Fa-f]{4}

True = "true"

False = "false"

Null = "null"

Number = (Minus? IntegralPart FractionalPart? ExponentPart?)

Minus = "-"

IntegralPart = "0" / [1-9] [0-9]*

FractionalPart = "." [0-9]+

ExponentPart = ( "e" / "E" ) ( "+" / "-" )? [0-9]+

S = [\u0009\u000A\u000D\u0020]+
