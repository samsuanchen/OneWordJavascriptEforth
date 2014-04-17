// 	OneWordJavascriptEforth.js	2012/02/16 ~ 2014/04/08
//	YapCheaHshen@gmail.com, SamSuanChen@gmail.com, ChenHanSunDing@gmail.com
( function() { 					// main
  'uses strict' 				// sytax checking for all undefined
  function eForthVM () {		// VM for eForth
	this.exec = exec			// outer interpreter (the export function)
	this.type = 0				// function for typing out (the import function)
	var compiledCode = [0]		// high level compiled code space
	this.getCompiledCode = function getCompiledCode(){
		return compiledCode		// high level compiled code space
	}
	this.setCompiledCode = function setCompiledCode(c){
		return compiledCode = c	// high level compiled code space
	}
	var words = [0]				// list of all defined words
	this.getWords = function getWords(){
		return words			// list of all defined words
	}
	this.setWords = function setWords(w){
		return words = w		// list of all defined words
	}
	var dictionary = {}			// object for the word id list of each unique name
	this.getDictionary = function getDictionary(){
		return dictionary		// object for the word id list of each unique name
	}
	this.setDictionary = function setDictionary(d){
		return dictionary = d	// object for the word id list of each unique name
	}
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
	this.reset=reset
	function reset	 (   ) { error = 1, dStk = [], rStk = [] }
	this.print=print
	function print	 (msg) { if (type && msg) type(msg)		 }
	this.cr=cr
	function cr		 (   ) { print("\n"					   ) }
	this.showOk=showOk
	function showOk  (txt) { print(' <ok>' + txt.replace(/</g,'&lt;') + '</ok>' ) }
	this.showInp=showInp
	function showInp (txt) { print('<inp>' + txt.replace(/</g,'&lt;') + '</inp> ') }
	this.showWrn=showWrn
	function showWrn (txt) { print('<wrn>' + txt.replace(/</g,'&lt;') + '</wrn>') }
	this.showErr=showErr
	function showErr (txt) { print('<err>' + txt.replace(/</g,'&lt;') + '</err>\n') }
	this.abort=abort
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
					return '<err>' +  t.replace(/</g,'&lt;') + '</err>'		//
				})															//
				O = O.join('\n<inp>code ')									// join output
				if (out) out = O											//
				else output.innerHTML = O									// update output
			//////////////////////////////////////////////////////////////////
		}	}
		showErr('\n' + msg + '\n'); reset() 
	}
	this.notWhiteSpaces=notWhiteSpaces
	function notWhiteSpaces (c) { return c != ' ' && c != '\t' && c != '\n' }
	function ignoreWhiteSpaces () {
		while (iTib < tib.length) {
			if (notWhiteSpaces(tib.charAt(iTib))) break
			iTib++
	}	}
	this.ignoreWhiteSpaces=ignoreWhiteSpaces
	this.nxtTkn=nxtTkn
	function nxtTkn (deli) {
	 	token = tib.substr(iTib)
		if (deli) {
			token = token.substr(1)
			if ((i = token.indexOf(deli))>=0) {
				token = token.substr(0,i)
				iTib += deli.length+1
			}
		} else {
			ignoreWhiteSpaces()
			if (m = token.match(/\S+/))
				token = m[0]
		}
		iTib += token.length
		return token
	}
	this.fndWrd=fndWrd
	function fndWrd (name) {				// get word id of given name
		var ID = IDs = dictionary[name]		// get all ids of given name
		if (IDs) ID = IDs[IDs.length-1]		// get last id of given name
		return ID							// could be undefined
	}
	this.compile=compile
	function compile (x) { compiledCode[dp++] = x }	// compile x (could be any thing)
	this.compileCode=compileCode
	function compileCode (ID, n) {			// compile a forth word (given index or name)
		if (typeof(ID) === "string") {
			var name = ID
			ID = fndWrd(name)
			if (!ID) { 
				abort('"'+name+'" undefined for token "'+token+'"')
				return
		}	}
		compile(ID)
		if (n !== undefined) compile(n) 	// n could be 0
	}
	this.parseNum=parseNum
	function parseNum (token) { var n
		if ( token.match(/^\$[0-9A-Fa-f]+$/) )	// hex number syntax of leading $
			n = parseInt(token.substr(1), 16)
		else if (base !== 10)					// non-decimal number
			n = parseInt(token, base)
		else if (! isNaN(token))				// decimal floating number
			n = parseFloat(token)
		return n								// n could be undefined
	}
	this.exec=exec
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
				showInp(tib)
				do {
					token = nxtTkn() 						// get token
					if (!token) break
					ID = fndWrd(token) 						// search word for ID
					if (ID) {
						word = words[ID]						// get word
						if (word.immediate || ! compiling) {
							if (debugged.indexOf(ID)>=0) {		// check if being debugged
								dbg(ID)							// debug
							}
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
		VM.ignoreWhiteSpaces()
		var token = VM.nxtTkn(), line, n, xt
		var name = token
		while (tib.substr(iTib).indexOf(end_code)<0 && lines.length)  {
			line = '\r\n'+lines.shift(); tib += line; VM.showInp(line)
		}
		n = tib.substr(iTib).indexOf(end_code)
		if (n >= 0) {
			var c = tib.substr(iTib, n)
			if (name === 'function') {
				name = VM.nxtTkn()
				c = 'this.' + name + '=function' + c
			} else
				c = 'xt = ' + c
			eval(c)
			iTib += n + end_code.length
			if (token !== 'function')
				VM.newWord(name,xt)
		} else VM.abort('"code ' + name + '" sould be ended with "end-code"')
	}
	this.newWord=newWord
	function newWord (name, xt, src, compileOnly, immediate) {
		var word = {
			name		: name				 ,
			xt			: xt				 ,
			src			: src			|| '',
			compileOnly : compileOnly	|| 0 ,
			immediate	: immediate		|| 0
		}
		var IDs = dictionary[name], ID = words.length
		if (IDs) {
			IDs.push(ID)
			print(' <wrn>"' + name.replace(/</g,'&lt;') +
					'" redefined ' + IDs + ' </wrn>') 
		} else dictionary[name] = [ID]
		words.push(word)
 		console.log(
 			'words['+ID+']',
 			'name:'+words[ID].name,
 			'depth:'+dStk.length,
 			'tib:'+tib.substr(iTib)
 		)
	}
	this.deCompile=deCompile
	function deCompile (id) {
		var src = words[id].src, name = words[id].name
		src = src		?
			':' + src	:
			'code ' + name + ' ' + words[id].xt + ' end-code'
		if (words[id].compileOnly) src += ' compileOnly'
		if (words[id].immediate  ) src += ' immediate'
		src = 'words[' + id + '] ' + name + '\n' + src
		return src
	}
	var debugged = []
 	function dbg (id) {
 		var msg
 		if (!id) {				// id undefined
	 		id = words.length-1
	 		msg = 'showing '	// pause if id   undefined and set break point here
	 	} else {				// id in debugged
 			if (!outputStepwise.checked) {
 				outputStepwise.checked=1
 				output.innerHTML+=out, out=''
 				output.scrollTop = output.scrollHeight
 			}
 			msg = 'debugging '	// pause if id in debugged and set break point here
 		}
 		msg += VM.deCompile(id)
 		VM.showWrn(msg)
 		console.log(msg)
 	}							// list of id being debugged
	this.execute=execute
	function execute (xt) {
		if (typeof(xt)==="function")
			 xt()								// execute low  level compiled code
		else call(xt)							// execute high level compiled code
	}
	this.call=call
	function call (iCompiledCode) { var id, xt	// inner compiled code interpreter
		var rStkLen = rStk.length
		rStk.push(ip)							// 
		error=0, ip=iCompiledCode
		while (rStk.length > rStkLen) {
		    id=compiledCode[ip++]
		    xt=words[id].xt
			execute (xt)
	}	}
 	newWord('code', code)		// this should be the only defined word
 	newWord('dbg',dbg)			// this is just for debugging to show last defined
  } 			
  window.eForthVM = eForthVM	// export
} ) (); 						// execute Main