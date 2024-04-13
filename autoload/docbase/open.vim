function! docbase#open#teams_list(mods="")
  call denops#notify("docbase", "openBuffer", ["TeamList", a:mods])
endfunction

function! docbase#open#posts_list(domain, mods="")
  call denops#notify("docbase", "openBuffer", ["PostList", {"domain": a:domain}, a:mods])
endfunction

function! docbase#open#post(domain, post_id, mods="")
  call denops#notify("docbase", "openBuffer", ["Post", {"domain": a:domain,"postId": a:post_id}, a:mods])
endfunction

function! docbase#open#new_post(domain, mods="")
  call denops#notify("docbase", "openBuffer", ["NewPost", {"domain": a:domain}, a:mods])
endfunction


