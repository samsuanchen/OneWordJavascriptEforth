code immediate function () { // 定義 immediate 宣告 最後定義的 指令 在編譯狀態 也能執行
  words[words.length-1]		// 最後定義的 指令
  .immediate=1			// 設定為 在編譯狀態 也能執行
} end-code
code \ function () { // 定義 \ 忽略原碼字串到 列尾
  iTib=tib.length		// iTib 指到 tib 之後
} end-code immediate		\  設定 反斜線符號 指令 在編譯狀態 也能執行
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
\ 前述 code 指令 定義了 immediate 及 反斜線符號 倆新指令, 反斜線符號 用作註解	\
\ 注意! 反斜線符號 之後必須 空格 這樣 接下來的原碼字串 才會當作 註解 直到列尾	\
\ code 之後是所定義 新指令的名稱, 接下來直到 end-code 為 javascript function	\
\ 注意! 其間 必須依循 javascript 語法 並以 雙斜線之後 直到列尾的字串 作為註解	\
\ 用 code 所定義的 是所謂 低階指令 皆以 javascript  function 指定所要相關動作	\
\ 在此之後用 code 所定義 冒號 : 及 分號 ; 倆指令 則是特別用來定義所謂 高階指令 的	\
\ 冒號指令 須接 空格 然後才是 新指令名稱, 之後 就可用所有已定義指令指定所要的動作	\
\ 直到 分號指令為止, 其間包括用 反斜線符號 指令 接 空格 直到列尾的字串 當作註解	\
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
code find function () { // 定義 find 取得 已定義指令的 id (在 words 中的序號)
  var id=fndWrd(nxtTkn())	// 以 隨後 token 作 指令名稱 取其 id
  dStk.push(id)			// id 可能是 undefined
} end-code
code ' function () { // 定義 ' 取得 已定義指令的 id (在 words 中的序號)
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
code compileOnly function () { // 定義 compileOnly 宣告 最後定義的 指令 在編譯狀態 才能編碼
  words[words.length-1]		// 最後定義的 指令
  .compileOnly=1		// 設定為 編譯狀態 才能編碼
} end-code
code ret function () { // 定義 ret 結束被呼叫的 高階指令 回上一層 繼續跑
  ip=rStk.pop()			// 從 rStack 取出 ip
} end-code compileOnly		\  設定 ret 在編譯狀態 才能編碼
code doLit function () { // 定義 doLit 將 隨後編碼 放上堆疊
  dStk.push(compiledCode[ip++])	// 將 ip 所指 編碼 放上堆疊
} end-code compileOnly		\  宣告 doLit 在編譯狀態 才能編碼
code ; function () { // 定義 words ; 結束 高階指令
  compileCode("ret")		// 編譯 ret 作為 高階指令 內碼
  compiling=0			// 結束 高階指令 編譯狀態
  if (src)
    src+=tib.substr(0,iTib)	// 高階指令 的 原碼字串 (多列)
  else
    src=tib.substring(hSrc,iTib)// 高階指令 的 原碼字串 (一列)
  newWord(hName,hXt,src)	// 以 名稱 內碼起點 原碼字串 定義 高階指令
} end-code
  compileOnly immediate		\  宣告 ; 在編譯狀態 才能編碼 也能執行
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
    t+=' '+w			// 以空格區隔
  print(t)			// 列印
} end-code
uniqueWords \ 檢視 所有 指令名稱 (不重複)
: sq \ 定義 sq 將 堆頂數值 平方
  dup				\  複製 堆頂數值
  *				\  相乘
;				\  結束 定義
5 sq .				\  列印 5 的 平方
dbg
: 2sq
  sq
  2 * 
; 3 2sq .
code char function () { // 定義 char 
  var c=nxtTkn().substr(0,1)
  if(compiling) compileCode('doLit',c)
  else dStk.push(c)
} end-code immediate
char a .
: a char a . ; a
code see function () {
  var name=nxtTkn(), ids=dictionary[name]
  var msg
  if (ids) {
    var w=words[ids[ids.length-1]]
    if (w.src) msg=':'+w.src
    else msg='code '+name+' '+w.xt+' end-'+'code'
    if (w.compileOnly) msg+=' compileOnly'
    if (w.immediate  ) msg+=' immediate'
  } else msg=name+' '+msg
  print('\n'+msg)
} end-code
see see
see a
see 2sq
see ;
see xxx