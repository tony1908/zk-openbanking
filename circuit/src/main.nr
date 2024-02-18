fn main(x: u8, y: u8) {
    assert(x > y);
}

#[test]
fn test_main() {
    main(2, 1);
    // Uncomment to make test fail
    // main(1, 1);
}
