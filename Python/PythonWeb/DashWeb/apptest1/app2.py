import dash
from dash import html

app = dash.Dash(__name__)

app.layout = html.Div(
    [
        html.H1('标题1'),
        html.H1('标题2'),
        html.P(['测试', html.Br(), '测试']),
        html.Table(
            html.Tr(
                [
                    html.Td('第一列'),
                    html.Td('第二列')
                ]
            )
        )
    ]
)

# Dash is running on http://127.0.0.1:8050/
if __name__ == '__main__':
    app.run_server()