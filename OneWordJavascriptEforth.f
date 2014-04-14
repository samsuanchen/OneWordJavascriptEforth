code immediate function () { // 定義 immediate 使 最後定義的指令 編譯狀態能執行
  words[words.length-1]		// 最後定義的 指令
  .immediate=1			// 設定為 編譯狀態能執行
} end-code
code \ function () { // 定義 \ 忽略原碼字串到 列尾
  iTib=tib.length		// iTib 指到 tib 之後
} end-code immediate		\  設定 反斜線符號指令 在編譯狀態也能執行
\ \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ \
\			R E A D M E   F I R S T				\
\ \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ \
\ A 前述 code 指令 定義了 immediate 及 反斜線符號 倆新指令, 反斜線符號 用作註解	\
\   注意! 反斜線符號 之後必須 空格 這樣 接下來的原碼字串 才會當作 註解 直到列尾	\
\ B code 之後是 新指令名稱, 接下來直到 end-code 為所對應的 javascript function	\
\   注意! 其間 必須依循 javascript 語法 並以 雙斜線之後 直到列尾的字串 作為註解	\
\ C 用 code 所定義的 是所謂 低階指令 均以 javascript function 描述所指定相關動作	\
\ D 注意! code 之後 如果是字串 function, 此 function 並不當作要定義的 指令名稱	\
\   這時 從 function 到 end-code 之前 是純粹用來 定義 javascript function 的	\
\   這 javascript function 的名稱在 字串 function 後 並且可在圓括號內宣告參數	\
\ E 在此之後用 code 所定義 冒號 : 及 分號 ; 倆指令 是特別用來定義所謂 高階指令 的	\
\   冒號指令 須接 空格 然後才是 新指令名稱, 之後 就可用所有已定義指令描述所要的動作	\
\   直到 分號指令為止, 其間包括用 反斜線符號 指令 接 空格 直到列尾的字串 當作註解	\
\ F 清空此 text area 選點 evalute 然後 按 F5 鍵 可從新恢復 text area 原始範例	\
\ \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ \
code find function () { // 定義 find 取得 已定義指令的 id (在 words 中的序號)
  var id=fndWrd(nxtTkn())	// 以 隨後 token 作 指令名稱 取其 id
  dStk.push(id)			// id 可能是 undefined
} end-code
code ' function () { // 定義 ' 取得 已定義指令的 id (在 words 陣列中的序號)
  var id=fndWrd(nxtTkn())	// 以 隨後 token 字串 作 指令名稱 取其 id
  if (id) dStk.push(id)		// 若 id 有定義 就放上堆疊
  else abort(id)		// 若 id 未定義 就 abort
} end-code
code alias function () { // 定義 alias 用以宣告 已定義指令 的別名
  var id=dStk.pop(), w=words[id]// 已定義指令 w
  newWord(nxtTkn(),w.xt,w.src)	// 其 別名 為 隨後 token 字串
} end-code
code : function () { // 定義 : 用以定義 高階指令
  src=''
  hSrc=iTib			// 定義 : hSrc 指到 原碼字串 起點
  hName=nxtTkn()		// hName 為 所要定義的 高階指令 名稱
  hXt=compiledCode.length 	// 以 hXt 指到 高階指令 編碼起點
  compiling=1			// 進入 編譯狀態
} end-code 
code compileOnly function () { // 定義 compileOnly 使 最後定義指令 編譯狀態才編碼
  words[words.length-1]		// 最後定義的 指令
  .compileOnly=1		// 設定為 編譯狀態才編碼
} end-code
code ret function () { // 定義 ret 結束被呼叫的 高階指令 回上一層 繼續跑
  ip=rStk.pop()			// 從 rStack 取出 ip
} end-code compileOnly		\  設定 ret 編譯狀態才編碼
code doLit function () { // 定義 doLit 將 隨後編碼 放上堆疊
  dStk.push(compiledCode[ip++])	// 將 ip 所指 編碼 放上堆疊
} end-code compileOnly		\  宣告 doLit 編譯狀態才編碼
code ; function () { // 定義 words ; 結束 高階指令
  compileCode("ret")		// 編譯 ret 作為 高階指令 內碼
  compiling=0			// 結束 高階指令 編譯狀態
  if (src)
    src+='\n'+tib.substr(0,iTib)// 高階指令 的 原碼字串 (多列)
  else
    src=tib.substring(hSrc,iTib)// 高階指令 的 原碼字串 (一列)
  newWord(hName,hXt,src)	// 以 名稱 內碼起點 原碼字串 定義 高階指令
} end-code
  compileOnly immediate		\  宣告 ; 編譯狀態 才編碼 能執行
code + function () { // 定義 + 取出 堆頂 倆數值 相加後 放上 堆頂 (也可用以銜接倆字串)
  var x=dStk.pop()		// 從堆疊取出 堆頂數值 n
  dStk[dStk.length-1]+=x	// 堆頂數值=堆頂數值+n
} end-code
code - function () { // 定義 - 取出 堆頂 倆數值 相減後 放上 堆頂
  var x=dStk.pop()		// 從堆疊取出 堆頂數值 n
  dStk[dStk.length-1]-=x	// 堆頂數值=堆頂數值-n
} end-code
code * function () { // 定義 * 取出 堆頂 倆數值 相乘後 放上 堆頂
  var x=dStk.pop()		// 從堆疊取出 堆頂數值 n
  dStk[dStk.length-1]*=x	// 堆頂數值=堆頂數值*n
} end-code
code / function () { // 定義 words / 取出 堆頂 倆數值 相除後 放上 堆頂
  var x=dStk.pop()		// 從堆疊取出 堆頂數值 n
  dStk[dStk.length-1]/=x	// 堆頂數值=堆頂數值/n
} end-code
code . function () { // 定義 . 取出 堆頂數值 列印
  print(" "+dStk.pop())		// 從堆疊取出 堆頂數值 列印
} end-code
code dup function () { // 定義 dup 複製 堆頂數值
  var x=dStk[dStk.length-1]	// 取 堆頂數值
  dStk.push(x)			// 放上堆疊
} end-code
code .s function () { // 定義 .s 檢視 堆疊數值
  var s=dStk.join(' ')		// 以空格區隔 之 堆疊數值字串
  s=s||'empty'			// 若 空字串 則用 'empty'
  print(' '+s)			// 列印 字串
} end-code
code words function () { // 定義 words 檢視 所有 指令名稱 (可能重複)
  var s=words.map(		// 從 words 陣列 針對每個指令 w
    function(w){return w.name}	// 取其 名稱
  ).join(' ')			// 以空格區隔
  print(' '+s)			// 列印
} end-code
words \ 檢視 所有 指令名稱
code uniqueWords function () { // 定義 uniqueWords 檢視 所有 指令名稱 (不重複)
  var t=''
  for(var w in dictionary)	// 從 dictionary 物件 針對每個指令 w
    t+=' '+w			// 採用	空格 區隔
  print(t)			// 列印
} end-code
uniqueWords \ 檢視 所有 指令名稱 (不重複)
: sq \ 定義 sq 計算 堆頂數值 的平方
  dup				\  複製	堆頂數值
  *				\  相乘
;				\  結束	定義
5 sq . \ 列印出 5 平方 ==> 25
' alias alias 同義
' sq 同義 平方  ' .  同義 印出  5 平方 印出
: 2sq \ 定義 2sq 計算 堆頂數值 平方的 2 倍
  sq				\  計算	堆頂數值 的平方
  2 *				\  取其	2 倍
;				\  結束	定義
3 2sq . \ 列印出 3 平方的2倍 ==> 18
' 2sq 同義 平方的2倍  3 平方的2倍 印出
code char function () { // 定義 char 取隨後 token 字串的 起首字符
  var c=nxtTkn().substr(0,1)	// 隨後	token 的 起首字符
  if(compiling)			// 檢視	是否 編譯狀態
    compileCode('doLit',c)	// 若是	編譯狀態 就將 doLit 及 字符 編碼
  else dStk.push(c)		// 否則	就將 字符 放上堆疊
} end-code immediate		\  宣告	char 編譯狀態能執行
char a .			\  列印	字符 a
: a char a . ;			\  定義	a 列印出 字符 a
a				\  列印	字符 a
code see function () { // 定義 see 檢視 指定名稱 指令 的定義源碼
  var msg			// 輸出	字串
  var name=nxtTkn()		// 隨後	token 當作 指令名稱
  var ids=dictionary[name]	// 取其	記錄 id 的陣列
  if (ids) {			// 檢視	記錄 id 的陣列 是否存在
    var id=ids[ids.length-1]	// 取其	最後的 id
    var w=words[id]		// 取其	word
    if (w.src)			// 檢視	高階定義源碼 是否存在
	msg=':'+w.src		// 若是	輸出字串 用 高階定義源碼
    else
	msg='code '+name	// 否則	字串 接 指令名稱
		   +' '+w.xt	//	字串 接 低階定義源碼
		   +' end-'	//	字串 接 'end-'
		   +'code'	//	字串 接 'code'
    if (w.compileOnly)		// 檢視	是否 compileOnly
      msg+=' compileOnly'	// 字串	加接 compileOnly
    if (w.immediate  )		// 檢視	是否 immediate
      msg+=' immediate'		// 字串	加接 immediate
  } else
      msg=name+' undefined'	// 字串	顯示 未定義
  print('\n'+msg)		// 列印	字串
} end-code
see see	\ 檢視 指令 see 的定義源碼
see a	\ 檢視 指令 a   定義源碼
see 2sq	\ 檢視 指令 2sq 的定義源碼
see ;	\ 檢視 指令 ;   的定義源碼

code function xxx (x) { // 定義 javascript function xxx (並非 定義 指令 xxx)
  print(x+' is running')
} end-code
see xxx	\ 檢視 字串 xxx 的定義源碼
code yyy function () {	// 定義 指令 zzz
  xxx(' yyy')		// 呼叫 javascript function xxx (帶 參數)
} end-code
yyy