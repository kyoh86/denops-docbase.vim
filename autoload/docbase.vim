function! docbase#open(handler, props, opener="edit")
  call denops#notify("docbase", "openBuffer", [a:handler, a:props, a:opener])
endfunction

function! docbase#open_team_list(opener="edit")
  call denops#notify("docbase", "openBuffer", ["TeamList", a:opener])
endfunction

function! docbase#open_post_list(domain, opener="edit")
  call denops#notify("docbase", "openBuffer", ["PostList", {"domain": a:domain}, a:opener])
endfunction

function! docbase#open_post(domain, post_id, opener="edit")
  call denops#notify("docbase", "openBuffer", ["Post", {"domain": a:domain,"postId": a:post_id}, a:opener])
endfunction

function! docbase#open_post_new(domain, opener="edit")
  call denops#notify("docbase", "openBuffer", ["PostNew", {"domain": a:domain}, a:opener])
endfunction

function! docbase#login()
  call denops#notify("docbase", "login", [])
endfunction
