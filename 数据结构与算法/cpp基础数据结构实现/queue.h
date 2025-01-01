#ifndef QUEUE_H
#define QUEUE_H

#include "arraydeque.h"

template <class T>
class Queue {
public:
    void push(const T& input) { q.push_back(input); }
    void pop() { q.pop_front(); }
    void clear() { q.clear(); }

    T front() const { return q.front(); }
    int size() const { return q.size(); }
    bool empty() const { return q.empty(); }
private:
    ArrayDeque<T> q;
};

#endif