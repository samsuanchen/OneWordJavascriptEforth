// 	OneWordJavascriptEforth.js	2012/02/16 ~ 2014/04/08
//	YapCheaHshen@gmail.com, SamSuanChen@gmail.com, ChenHanSunDing@gmail.com
( function() { 					// main
  'uses strict' 				// check all undefined references
  function eForthVM () {		// VM for eForth
	this.exec = exec			// outer interpreter (the export function)
	this.type = 0				// function for typing out (the import function)
	var compiledCode = [0]
	var dStk = [], rStk = [], lines=[], tib = "", token = ""
	var ip = 0, dp = 1, error = 0, compiling = 0, iTib = 0, base = 10, hName, hXt
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
			var p = /token (.+)/, m = msg.match(p)
			if (m) {
				msg += '\nWhile coding low level word "' + token +'"'
				var tkn = m[1].replace(/([\]\[\)\(\}\{\.\+\*\?\\])/g,function(m){
					return '\\'+m
				})
				var O=output.innerHTML.split(/<\/inp>\n<inp>\s*code /)
				L=O[O.length-1]
				O[O.length-1]=L.replace(RegExp(tkn,'g'),function(t) {
					return '<err>'+t+'</err>'
				})
				output.innerHTML=O.join('\ncode ')
		}	}
		showErr('\n' + msg + '\n'); reset() 
	}
	function notWhiteSpaces (c) { return c != ' ' && c != '\t' && c != '\n' }
	function ignoreWhiteSpaces () {
		while (iTib < tib.length) {
			if (notWhiteSpaces(tib.charAt(iTib))) break
			iTib++
	}	}
	function nextToken () {
	 	ignoreWhiteSpaces()
		token = ""
		var m = tib.substr(iTib).match(/\S+/)
		if (m) { token = m[0]; iTib += tib.substr(iTib).indexOf(token) + token.length }
		return token
	}
	var dictionary = {}, words = [0]
	function findword (name) {				// get word ID by given name
		var ID = IDs = dictionary[name]		// get all ids of given name
		if (IDs) ID = IDs[IDs.length-1]		// get last id
		return ID							// could be undefined
	}
	function compile (x) { compiledCode[dp++] = x }	// compile x (could be any thing)
	function compileCode (ID, n) {			// compile a forth word (given index or name)
		if (typeof(ID) === "string") {
			var name = ID
			ID = findword(name)
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
		lines = cmds.split(/\r?\n/), error = 0
		var ID, word, n
		while (lines.length) {
			tib = lines.shift(), iTib = 0	
			if (tib.trim()) {
				showInp(tib.replace(/</g,'&lt;'))
				do {
					token = nextToken() 						// get token
					if (!token) break
					ID = findword(token) 						// search word for ID
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
	var code = function() { // code ( <name> -- ) define new word using javaScript
		ignoreWhiteSpaces()
		var name = nextToken(), line, func, n, xt
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
			print(' <wrn>"' + name + '" redefined ' + IDs.length + ' times</wrn>') 
		} else dictionary[name] = [nWords]
		words.push(word)
	}
 	newWord("code", code)					// the only defined word
  } 			
  window.eForthVM = eForthVM				// export
} ) (); 									// execute Main