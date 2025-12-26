import dash
import dash_bootstrap_components as dbc
from dash import html

app = dash.Dash(__name__)

app.layout = html.Div(
    dbc.Container(
        [
            html.Iframe(src='https://www.bilibili.com/',
                        style={'width': '100%', 'height': '800px'})
        ]
    )
)

if __name__ == "__main__":
    app.run_server(debug=True)