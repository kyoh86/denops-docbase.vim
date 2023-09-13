nnoremap <buffer> <plug>(docbase-buffer-action-posts-list-open) <cmd>call docbase#buffer_action#posts_list#open(line("."))
nnoremap <buffer> <plug>(docbase-buffer-action-posts-list-open-new) <cmd>call docbase#buffer_action#posts_list#open(line("."), "new")
nnoremap <buffer> <plug>(docbase-buffer-action-posts-list-open-vnew) <cmd>call docbase#buffer_action#posts_list#open(line("."), "vnew")
nnoremap <buffer> <plug>(docbase-buffer-action-posts-list-open-tabedit) <cmd>call docbase#buffer_action#posts_list#open(line("."), "tabedit")

nnoremap <buffer> <plug>(docbase-buffer-action-posts-list-prev) <cmd>call docbase#buffer_action#posts_list#prev()
nnoremap <buffer> <plug>(docbase-buffer-action-posts-list-next) <cmd>call docbase#buffer_action#posts_list#next()
