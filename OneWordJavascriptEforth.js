// 	OneWordJavascriptEforth.js	2012/02/16 ~ 2014/04/08
//	YapCheaHshen@gmail.com, SamSuanChen@gmail.com, ChenHanSunDing@gmail.com
( function() { 					// main
  'uses strict' 				// sytax checking for all undefined
  function eForthVM () {		// VM for eForth
	this.exec = exec			// outer interpreter (the export function)
	this.type = 0				// function for typing out (the import function)
	var	src = ""				// high level source code
	var	user = []				// user variable data space
	var dStk = []				// data stack passing process result among words
	var	rStk = []				// return stack for high level calling
	var compiledCode = [0]		// list keeping high level compiled code space
	var words = [0]				// list of all defined words
	var dictionary = {}			// object for the word id list of each unique name
	var	lines = []				// source code waiting for processing
	var line					// line just shifted out for processing 
	var	tib = ""				// source code for processing
	var iTib = 0				// offset for source code being processed
	var	token = ""				// curren parsed token
	var ip = 0					// point to compiled code during processing
	var dp = 1					// point to compiled code during compiling
	var error = 0				// error code of illegal syntax
	var compiling = 0			// state of compiling
	var base = 10				// number convering base (delfault 10 for decimal)
	var hName					// name 				 of high level word (being defined)
	var hSrc					// source   code pointer of high level word (being defined)
	var hXt						// compiled code pointer of high level word (being defined)
	function reset	 (   ) { error = 1, dStk = [], rStk = [] }
	function print	 (msg) { if (type && msg) type(msg)		 }
	function cr		 (   ) { print("\n"					   ) }
	function showOk  (txt) { print(' <ok>' + txt + '</ok>' ) }
	function showInp (txt) { print('<inp>' + txt + '</inp>') }
	function showWrn (txt) { print('<wrn>' + txt + '</wrn>') }
	function showErr (txt) { print('<err>' + txt + '</err>') }
	function abort   (msg) {
		if (compiling) {
			compiling = 0
			msg += '\nWhile defining high level word "' + hName +'"'
		} else {
			var m = msg.match(/token (.+)/)
			if (m) {
				msg += '\nWhile coding low level word "' + token +'"'
			//////////////////////////////////////////////////////////////////
				var t = m[1].replace(/[\][(){}.+*?]/g,function(m){			//
					return '\\'+m											//
				})															//
				var p = RegExp(t,'g')										//
				var O = output.innerHTML.split(/<\/inp>\n<inp>\s*code /)	//
				var L = O[O.length-1]										//
				O[O.length-1] = L.replace(p,function(e) {					//
					return '<err>' +  e + '</err>'							//
				})															//
				output.innerHTML=O.join('\ncode ')							//
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
			 xt()							// execute low  level compiled code
		else call(xt)						// execute high level compiled code
	}
	function call (icompiledCode) { var ID, xt		// inner interpreter (compiled code)
		rStk.push(ip)
		error=0, ip=icompiledCode
		while (ip) {
		    ID=compiledCode[ip++], xt=words[ID].xt; 
			if (typeof(xt) === 'function') xt()
			else call(xt)
	}	}
	function parseNum (token) { var n
		if ( token.match(/^\$[0-9A-Fa-f]+$/) )
			n = parseInt(token.substr(1), 16)
		else if (base !== 10)
			n = parseInt(token, base)
		else if (! isNaN(token))
			n = parseFloat(token)
		return n							// could be undefined
	}
	function exec (cmds) {					// outer interpreter (source code)
		lines = cmds.split(/\r?\n/), error = 0, src='', compiling = 0
		var ID, word, n
		while (lines.length) {
			if (compiling) {
				if (src) src += '\n'+tib
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
	var code = function() { // code ( <name> -- ) define a new word using javaScript
		ignoreWhiteSpaces()
		var name = nxtTkn(), line, func, n, xt
		while (tib.substr(iTib).indexOf(end_code)<0 && lines.length)  {
			line = '\r\n'+lines.shift(); tib += line; showInp(line)
		}
		n = tib.substr(iTib).indexOf(end_code)
		if (n >= 0) {
			eval('xt = ' + tib.substr(iTib, n))
			iTib += n + end_code.length; newWord(name,xt)
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