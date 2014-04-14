// 	OneWordJavascriptEforth.js	2012/02/16 ~ 2014/04/08
//	YapCheaHshen@gmail.com, SamSuanChen@gmail.com, ChenHanSunDing@gmail.com
( function() { 					// main
  'uses strict' 				// sytax checking for all undefined
  function eForthVM () {		// VM for eForth
	this.exec = exec			// outer interpreter (the export function)
	this.type = 0				// function for typing out (the import function)
	var compiledCode = [0]		// list keeping high level compiled code space
	var words = [0]				// list of all defined words
	var dictionary = {}			// object for the word id list of each unique name
	var	user = new Array(16)	// user data space
	var dStk	  = user[ 0] =[]// data stack passing process result among words
	var	rStk	  = user[ 1] =[]// return stack for high level calling
	var	lines	  = user[ 2] =[]// source code waiting for processing
	var line	  = user[ 3]		// line just shifted out for processing 
	var	tib		  = user[ 4] =""// source code for processing
	var iTib	  = user[ 5] = 0// offset for source code being processed
	var	token	  = user[ 6] =""// curren parsed token
	var ip		  = user[ 7] = 0// point to compiled code during processing
	var dp		  = user[ 8] = 1// point to compiled code during compiling
	var error	  = user[ 9] = 0// error code of illegal syntax
	var compiling = user[10] = 0// state of compiling
	var base	  = user[11] =10// number convering base (delfault 10 for decimal)
	var hName	  = user[12]	// name 				 of high level word (being defined)
	var hXt		  = user[13]	// compiled code pointer of high level word (being defined)
	var hSrc	  = user[14]	// source   code pointer of high level word (being defined)
	var	src		  = user[15] =""// high level source code
	function reset	 (   ) { error = 1, dStk = [], rStk = [] }
	function print	 (msg) { if (type && msg) type(msg)		 }
	function cr		 (   ) { print("\n"					   ) }
	function showOk  (txt) { print(' <ok>' + txt + '</ok>' ) }
	function showInp (txt) { print('<inp>' + txt + '</inp>') }
	function showWrn (txt) { print('<wrn>' + txt + '</wrn>') }
	function showErr (txt) { print('<err>' + txt + '</err>\n') }
	function abort   (msg) {
		if (compiling) {
			compiling = 0
			msg += '\nWhile defining high level word "' + hName +'"'
		} else {
			var m = msg.match(/Unexpected token (.+)/)
			if (m) {
				msg += '\nWhile coding low level word "' + token +'"'
			//////////////////////////////////////////////////////////////////
				var O = out || output.innerHTML								//
					O = O.split(/\n<inp>\s*code /)							// split output
				var S = O[O.length-1]										// the source code
				var p = RegExp(m[1].replace(/[\][(){}.+*?]/g, function(m){	// pattern for token
					return '\\'+m											// 
				}),'g')														//
				O[O.length-1] = S.replace(p,function(t) {					// highlight token
					return '<err>' +  t + '</err>'							//
				})															//
				O = O.join('\n<inp>code ')									// join output
				if (out) out = O											//
				else output.innerHTML = O									// update output
			//////////////////////////////////////////////////////////////////
		}	}
		showErr('\n' + msg + '\n'); reset() 
	}
	function notWhiteSpaces (c) { return c != ' ' && c != '\t' && c != '\n' }
	function ignoreWhiteSpaces () {
		while (iTib < tib.length) {
			if (notWhiteSpaces(tib.charAt(iTib))) break
			iTib++
	}	}
	function nxtTkn (deli) {
	 	ignoreWhiteSpaces()
		token = tib.substr(iTib)
		if (deli) {
			if ((i = token.indexOf(deli))>=0)
				token=token.substr(0,i)
		} else {
			if (m = token.match(/\S+/))
				token = m[0]
		}
		iTib += token.length
		return token
	}
	function fndWrd (name) {				// get word id of given name
		var ID = IDs = dictionary[name]		// get all ids of given name
		if (IDs) ID = IDs[IDs.length-1]		// get last id of given name
		return ID							// could be undefined
	}
	function compile (x) { compiledCode[dp++] = x }	// compile x (could be any thing)
	function compileCode (ID, n) {			// compile a forth word (given index or name)
		if (typeof(ID) === "string") {
			var name = ID
			ID = fndWrd(name)
			if (!ID) { 
				abort('"'+name+'" undefined for token "'+token+'"')
				return
		}	}
		compile(ID)
		if (n !== undefined) compile(n)
	}
	function execute (xt) {
		if (typeof(xt)==="function")
			 xt()								// execute low  level compiled code
		else call(xt)							// execute high level compiled code
	}
	function call (iCompiledCode) { var ID, xt	// inner compiled code interpreter
		var rStkLen = rStk.length
		rStk.push(ip)							// 
		error=0, ip=iCompiledCode
		while (rStk.length > rStkLen) {
		    ID=compiledCode[ip++]
		    xt=words[ID].xt; 
			if (typeof(xt) === 'function') xt()
			else call(xt)
	}	}
	function parseNum (token) { var n
		if ( token.match(/^\$[0-9A-Fa-f]+$/) )	// hex number syntax of leading $
			n = parseInt(token.substr(1), 16)
		else if (base !== 10)					// non-decimal number
			n = parseInt(token, base)
		else if (! isNaN(token))				// decimal floating number
			n = parseFloat(token)
		return n								// n could be undefined
	}
	function exec (cmds) {						// outer source code interpreter
		lines = cmds.split(/\n/)				// split source code into lines
		error = 0, compiling = 0, tib = src=''	// initial setting
		var ID, word, n							// local variables
		while (lines.length) {
			if (compiling) {
				if (src) src += '\n' + tib
				else src = tib.substr(hSrc)
			}
			tib = lines.shift(), iTib = 0
			if (tib.trim()) {
				showInp(tib.replace(/</g,'&lt;'))
				do {
					token = nxtTkn() 						// get token
					if (!token) break
					ID = fndWrd(token) 						// search word for ID
					if (ID) {
						word = words[ID]						// get word
						if (word.immediate || ! compiling) {
							try { execute(word.xt) }			// execute word
							catch(err) {
								error  = 'Abort at word "' + word.name + '", '
								error += 'because ' + err.message
								abort(error)					// error in javascript
							}
						} else compile(ID) 						// compile word
					} else {
						n = parseNum(token)						// parse number if no ID
						if (n === undefined) {
							error = '"' + token + '" undefined'
							abort(error)						// token undefined
						} else {
							if (compiling)
								compileCode("doLit", n)			// compile number
							else dStk.push(n) 					// push number
					}	}
				} while (! error)								// loop back if no error 
				if (error) break
				if (!compiling) showOk('ok')					// show ok
				cr()
	}	}	}
	var end_code = 'end-code'
	var code = function() { // code ( <name> -- ) define a new word using javascript
		ignoreWhiteSpaces()
		var name = nxtTkn(), line, n, xt
		while (tib.substr(iTib).indexOf(end_code)<0 && lines.length)  {
			line = '\r\n'+lines.shift(); tib += line; showInp(line)
		}
		n = tib.substr(iTib).indexOf(end_code)
		if (n >= 0) {
			eval('xt = ' + tib.substr(iTib, n))
			iTib += n + end_code.length
			newWord(name,xt)
		} else abort('"code ' + name + '" sould be ended with "end-code"')
	}
	function newWord (name, xt, src, compileOnly, immediate) {
		var word = {
			name		: name				 ,
			xt			: xt				 ,
			src			: src			|| '',
			compileOnly : compileOnly	|| 0 ,
			immediate	: immediate		|| 0
		}
		var IDs = dictionary[name], nWords = words.length
		if (IDs) {
			IDs.push(nWords)
			print(' <wrn>"' + name + '" defined ' + IDs.length + ' times</wrn>') 
		} else dictionary[name] = [nWords]
		words.push(word)
	}
 	newWord('code', code)					// this should be the only defined word
 	function dbg () {
 		console.log(words.length)
 	}
 	newWord('dbg',dbg)						// this is just for debugging
  } 			
  window.eForthVM = eForthVM				// export
} ) (); 									// execute Main