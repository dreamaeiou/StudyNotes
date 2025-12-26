import dash
import dash_bootstrap_components as dbc
import pandas as pd
from dash import dcc
from dash import html
from dash.dependencies import Input, Output
from sqlalchemy import create_engine

sql_name = "onlinetradingsystem"
mysql_engine = create_engine(f'mysql+pymysql://root:666666@localhost:3306/{sql_name}')

app = dash.Dash(__name__)

app.layout = html.Div(
    dbc.Container(
        [
            dbc.Row(
                [
                    dbc.Col(dbc.Button(f"更新当前数据库{sql_name}", id='refresh-db', style={'width': '100%'}), width=2),
                    dbc.Col (dcc.Dropdown (id='db-table-names', placeholder='选择库中数据表', style={'width': '100%'}),
                             width=4),
                    dbc.Col (dbc.Button ('查询', id='query', style={'width': '100%'}), width=1)
                ]
            ),
            html.Hr(),
            dbc.Row(
                [
                    dbc.Col(
                        id="query-result"
                    )
                ]
            )
        ],
        style={
            'margin-top': '50px'
        }
    )
)

@app.callback(
    Output("db-table-names", "options"),
    Input("refresh-db", "n_clicks"),
    prevent_initial_call=True
)

def refresh_db(n_clicks):
    table_names = pd.read_sql_query(f"select table_name from onlinetradingsystem.users where  table_schema='public'", con=mysql_engine)
    return [{'label': name, 'value': name} for name in table_names['tablename']]



if __name__ == '__main__':
    app.run_server(debug=True)