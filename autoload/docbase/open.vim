function! docbase#open#teams_list(opener="edit")
  call denops#notify("docbase", "openBuffer", ["TeamList", a:opener])
endfunction

function! docbase#open#posts_list(domain, opener="edit")
  call denops#notify("docbase", "openBuffer", ["PostList", {"domain": a:domain}, a:opener])
endfunction

function! docbase#open#post(domain, post_id, opener="edit")
  call denops#notify("docbase", "openBuffer", ["Post", {"domain": a:domain,"postId": a:post_id}, a:opener])
endfunction

function! docbase#open#new_post(domain, opener="edit")
  call denops#notify("docbase", "openBuffer", ["NewPost", {"domain": a:domain}, a:opener])
endfunction


