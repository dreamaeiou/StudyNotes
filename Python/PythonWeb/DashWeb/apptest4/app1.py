import dash
from dash import html

app = dash.Dash(__name__)

app.layout = html.Div(
    html.H1('我是热重载之前！')
)

if __name__ == '__main__':
    # debug：保持应用运行的情况下，修改源代码并保存之后，浏览器中运行的 Dash 实例会自动重启刷新。
    app.run_server(debug=True)