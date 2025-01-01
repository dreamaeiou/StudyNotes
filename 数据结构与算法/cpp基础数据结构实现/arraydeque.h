#ifndef ARRAYDEQUE_H
#define ARRAYDEQUE_H

#include <iostream>

template<class T>
class ArrayDeque {
public:
    ArrayDeque() { _init(); };
    ArrayDeque(int&& size) { _init(size); };
    ArrayDeque(const int& size) { _init(size); }
    ~ArrayDeque();

    /*    测试接口    */
    void debug() {
        std::cout << "-------------------------------------" << std::endl;
        std::cout << "capacity: " << capacity_  << " size: " << size_ << std::endl;
        if(empty())
            std::cout << "deque is empty\n";

        int l = p_front_, r = p_back_;
        while(l <= r && !empty())
            std::cout << "debug arr[" << l << "]: " << arr_[l++] << std::endl; 
    }
    
    ArrayDeque(const ArrayDeque<T>&) = delete;
    void operator=(const ArrayDeque<T>&) = delete;

    inline bool empty() const { return size_ == 0; }
    inline int size() const { return size_; }

    void push_back(const T&);
    void push_front(const T&);
    void pop_back();
    void pop_front();
    inline void clear() { size_ = 0; }

    inline T back() const { return arr_[p_back_]; }
    inline T front() const { return arr_[p_front_]; };

private:
    void _init(const int& size);
    void _init();

    void _expand();
    
    int size_;  // 元素个数
    int capacity_;  // 规模
    const double load_factor_ = 1.5;    // 装载因子
    T* arr_; // 底层数组
    int p_front_;   // 头指针
    int p_back_;    // 尾指针
};

template<class T>
void ArrayDeque<T>::_init(const int& size) {
    size_ = 0;
    capacity_ = size;
    arr_ = new T[capacity_];
    p_front_ = -1;
    p_back_ = -1;
}

template<class T>
void ArrayDeque<T>::_init() {
    _init(5);
}

template<class T>
void ArrayDeque<T>::_expand() {
    capacity_ *= 2; // 进行一个扩容

    int old_p = p_front_;

    p_front_ = capacity_ / 2 - size_ - 1;
    p_back_ = p_front_ + size_ - 2;

    T* newArr = new T[capacity_];

    for(int i = 0; i < size_ - 1; i++) {
        newArr[p_front_ + i] = arr_[old_p + i];
    }
    
    delete[] arr_;
    arr_ = newArr; 
}

template<class T>
ArrayDeque<T>::~ArrayDeque() {
    delete[] arr_;
    size_ = 0;
    capacity_ = 0;
    p_front_ = -1;
    p_back_ = -1;
}

template<class T>
void ArrayDeque<T>::push_back(const T& input) {
    if(size_ == 0) {
        p_back_ = capacity_ / 2;
        p_front_ = capacity_ / 2;
        
        arr_[p_back_] = input;
        size_++;
        return;
    }

    size_++;
    if((double)capacity_ / size_ < load_factor_) {
        _expand();
    }

    if(p_back_ + 1 >= capacity_)
        _expand();

    arr_[++p_back_] = input;
}

template<class T>
void ArrayDeque<T>::push_front(const T& input) {
    if(size_ == 0) {
        p_back_ = capacity_ / 2;
        p_front_ = capacity_ / 2;

        arr_[p_front_] = input;
        size_++;
        return;
    }

    size_++;
    if((double)capacity_ / size_ < load_factor_) {
        _expand();
    }

    if(p_front_ - 1 < 0) 
        _expand();

    arr_[--p_front_] = input;
}

template<class T>
void ArrayDeque<T>::pop_back() {
    if(size_ == 0)
        throw "already empty!\n";

    size_--;
    p_back_--;
}

template<class T>
void ArrayDeque<T>::pop_front() {
    if(size_ == 0)
        throw "already empty!\n";

    size_--;
    p_front_++;
}

#endif