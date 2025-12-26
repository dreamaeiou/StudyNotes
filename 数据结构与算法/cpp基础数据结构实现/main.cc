#include <iostream>

#include "listdeque.h"
#include "arraydeque.h"
#include "queue.h"

using namespace std;

int main() {
    ArrayDeque<int> q1(10);

    for(int i = 0; i < 10; i++)
        q1.push_back(i);

    for(int i = 10; i < 20; i++)
        q1.push_front(i);

    q1.debug();

    q1.clear();
    q1.debug();

    ListDeque<int> q2;
    
    for(int i = 0; i < 10; i++)
        q2.push_back(i);

    for(int i = 10; i < 20; i++)
        q2.push_front(i);

    q2.debug();

    q2.clear();
    q2.debug();

    Queue<int> q3;
    for(int i = 0; i < 10; i++) 
        q3.push(i);

    while(!q3.empty()) {
        cout << q3.front() << " ";
        q3.pop();
    }
    cout << endl;

}