import dash
from dash import dcc
from dash import html

app = dash.Dash(__name__)

app.layout = html.Div(
    [
        html.H1('下拉选择'),
        html.Br(),
        dcc.Dropdown(
            options=[
                {'label': '选项一', 'value': 1},
                {'label': '选项二', 'value': 2},
                {'label': '选项三', 'value': 3}
            ]
        )
    ]
)

# Dash is running on http://127.0.0.1:8050/
if __name__ == '__main__':
    app.run_server()