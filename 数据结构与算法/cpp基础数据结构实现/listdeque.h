#ifndef LISTDEQUE_H
#define LISTDEQUE_H

#include <cstddef>
#include <iostream>

template <class T>
class ListDeque {
private:
    struct Node {
        Node() : next(nullptr), last(nullptr), val(T()) {}

        Node* next;
        Node* last;
        T val;
    };

public:
    ListDeque() {
        size_ = 0;
        p_back_ = nullptr;
        p_front_ = nullptr;
    }
    ListDeque(ListDeque<T>&) = delete;
    void operator = (ListDeque<T>&) = delete;

    /*    功能测试    */
    void debug() {
        Node* temp = p_front_;
        std::cout << "-------------------------------------" << std::endl;
        std::cout << "size: " << size_ << std::endl;

        int cnt = 0;
        while(temp != nullptr) {
            std::cout << "debug [node cnt]: " << cnt++ << " value: " << temp->val << std::endl;
            temp = temp->next;
        }
    }

    inline bool empty() const { return size_ == 0; }

    void push_back(const T&);
    void push_front(const T&);
    void pop_back();
    void pop_front();
    void clear();

    inline T front() const { return p_front_->val; }
    inline T back() const { return p_back_->val; }

private:
    int size_;
    Node* p_back_;  // 头指针
    Node* p_front_; // 尾指针
};

template <class T>
void ListDeque<T>::push_back(const T& input) {
    Node* temp = new Node;
    temp->val = input;

    if(size_ == 0) {
        p_back_ = temp;
        p_front_ = temp;
        
        size_++;
        return;
    }
    
    size_++;
    temp->last = p_back_;
    p_back_->next = temp;
    p_back_ = p_back_->next;
}

template <class T>
void ListDeque<T>::push_front(const T& input) {
    Node* temp = new Node;
    temp->val = input;

    if(size_ == 0) {
        p_back_ = temp;
        p_front_ = temp;

        size_++;
        return;
    }

    size_++;
    temp->next = p_front_;
    p_front_->last = temp;
    p_front_ = p_front_->last;
}

template <class T>
void ListDeque<T>::pop_back() {
    Node* temp = p_back_;
    if(p_back_->last != nullptr)
        p_back_ = p_back_->last;

    delete temp;
}

template <class T>
void ListDeque<T>::pop_front() {
    Node* temp = p_front_;
    if(p_front_->next != nullptr)
        p_front_ = p_front_->next;

    delete temp;
}

template <class T>
void ListDeque<T>::clear() {
    Node* temp = p_front_;
    while(temp != nullptr) {
        Node* n = temp->next;
        
        delete temp;
        temp = n;
    }
    size_ = 0;
    p_back_ = nullptr;
    p_front_ = nullptr;
}

#endif