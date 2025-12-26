import dash
import dash_bootstrap_components as dbc
from dash import dcc
from dash import html

app = dash.Dash(
    __name__,
    external_stylesheets=['css/bootstrap.min.css']
)

app.layout = html.Div(
    [
        # fluid默认为False
        dbc.Container(
            [
                dcc.Dropdown(),
                '测试',
                dcc.Dropdown()
            ]
        ),

        html.Hr(), # 水平分割线

        # fluid设置为True
        dbc.Container(
            [
                dcc.Dropdown(),
                '测试',
                dcc.Dropdown()
            ],
            fluid=True
        )
    ]
)

if __name__ == "__main__":
    app.run_server(debug=True)