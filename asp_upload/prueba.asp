<%@ Language=VBScript %>
<% 
option explicit 
Response.Expires = -1
Server.ScriptTimeout = 600
' All communication must be in UTF-8, including the response back from the request
Session.CodePage  = 65001
%>
<!-- #include file="freeaspupload.asp" -->
<%

Dim Upload
Set Upload = New FreeASPUpload
Upload.Save(Server.MapPath(".") & "\upload")
  
%>