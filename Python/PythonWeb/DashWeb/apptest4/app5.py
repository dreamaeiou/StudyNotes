import dash
import dash_bootstrap_components as dbc
from dash import dcc
from dash import html
from dash.dependencies import Input, Output

app = dash.Dash(
    __name__,
    external_stylesheets=['css/bootstrap.min.css'],
    # 自动忽略回调匹配错误
    suppress_callback_exceptions=True
)

app.layout = html.Div(
    dbc.Container(
        [
            dbc.Row(
                [
                    dbc.Col(
                        dbc.Input(id='input_num')
                    ),
                    dbc.Col(id='output_item')
                ]
            ),
            dbc.Row(
                dbc.Col(
                    dbc.Label(id='output_desc')
                )
            )
        ]
    )
)


@app.callback(
    Output('output_item', 'children'),
    Input('input_num', 'value'),
    prevent_initial_call=True
)
def callback1(value):
    return dcc.Dropdown(
        id='output_dropdown',
        options=[
            {'label': i, 'value': i}
            for i in range(int(value))
        ]
    )


@app.callback(
    Output('output_desc', 'children'),
    Input('output_dropdown', 'options'),
    prevent_initial_call=True
)
def callback2(options):
    return '生成的Dropdown部件共有{}个选项'.format(options.__len__())

if __name__ == "__main__":
    app.run_server(debug=True)