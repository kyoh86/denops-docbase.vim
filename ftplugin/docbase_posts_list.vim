nnoremap <buffer> <plug>(docbase-buffer-action-posts-list-open) <cmd>call docbase#buffer_action#posts_list#open(line("."), "")<cr>
nnoremap <buffer> <plug>(docbase-buffer-action-posts-list-open-new) <cmd>call docbase#buffer_action#posts_list#open(line("."), "horizontal")<cr>
nnoremap <buffer> <plug>(docbase-buffer-action-posts-list-open-vnew) <cmd>call docbase#buffer_action#posts_list#open(line("."), "vertical")<cr>
nnoremap <buffer> <plug>(docbase-buffer-action-posts-list-open-tabedit) <cmd>call docbase#buffer_action#posts_list#open(line("."), "tab")<cr>

nnoremap <buffer> <plug>(docbase-buffer-action-posts-list-prev) <cmd>call docbase#buffer_action#posts_list#prev()<cr>
nnoremap <buffer> <plug>(docbase-buffer-action-posts-list-next) <cmd>call docbase#buffer_action#posts_list#next()<cr>
