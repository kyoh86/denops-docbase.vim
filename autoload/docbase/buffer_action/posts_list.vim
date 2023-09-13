function! docbase#buffer_action#posts_list#open(lnum, opener = "edit")
  call denops#notify("docbase", "bufferAction", [bufnr(), "open", {"lnum": a:lnum, "opener": a:opener}])
endfunction

function! docbase#buffer_action#posts_list#prev()
  call denops#notify("docbase", "bufferAction", [bufnr(), "prev", {}])
endfunction

function! docbase#buffer_action#posts_list#next()
  call denops#notify("docbase", "bufferAction", [bufnr(), "next", {}])
endfunction
