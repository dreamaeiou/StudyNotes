import dash
import dash_bootstrap_components as dbc
from dash import html

app = dash.Dash(__name__)


# Th:加粗 Td:正常文字
app.layout = html.Div(
    dbc.Container(
        dbc.Table(
            [
                html.Thead(
                    html.Tr(
                        [
                            html.Th('字段1'),
                            html.Th('字段2')
                        ]
                    )
                ),
                html.Tbody(
                    [
                        html.Tr(
                            [
                                html.Th('1'),
                                html.Td('test1')
                            ]
                        ),
                        html.Tr(
                            [
                                html.Th('2'),
                                html.Td('test2')
                            ]
                        ),
                        html.Tr(
                            [
                                html.Td('3'),
                                html.Td('test3')
                            ]
                        ),
                        html.Tr (
                            [
                                html.Td('4'),
                                html.Th('test4')
                            ]
                        )
                    ]
                )
            ],
            striped=True
        ),
        style={
            'margin-top': '50px'  # 设置顶部留白区域高度
        }
    )
)

if __name__ == '__main__':
    app.run_server(debug=True)