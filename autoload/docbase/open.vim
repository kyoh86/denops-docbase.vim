function! docbase#open#team_list(opener="edit")
  call denops#notify("docbase", "openBuffer", ["TeamList", a:opener])
endfunction

function! docbase#open#post_list(domain, opener="edit")
  call denops#notify("docbase", "openBuffer", ["PostList", {"domain": a:domain}, a:opener])
endfunction

function! docbase#open#post(domain, post_id, opener="edit")
  call denops#notify("docbase", "openBuffer", ["Post", {"domain": a:domain,"postId": a:post_id}, a:opener])
endfunction

function! docbase#open#post_new(domain, opener="edit")
  call denops#notify("docbase", "openBuffer", ["PostNew", {"domain": a:domain}, a:opener])
endfunction


