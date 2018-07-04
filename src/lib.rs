// The original code was from https://github.com/BurntSushi/rust-snappy/blob/master/src/crc32.rs
// and its license is https://github.com/BurntSushi/rust-snappy/blob/master/COPYING
// I changed it a little thus made it require less 3rd-party crates 
#[macro_use]
extern crate lazy_static;

extern { 
  fn logInt(s: u32);
}

const POLY: u32 = 0xedb88320;

lazy_static! {
    static ref TABLE: [u32; 256] = make_table(POLY);
    static ref TABLE8: [[u32; 256]; 8] = {
        let mut tab = [[0; 256]; 8];
        tab[0] = make_table(POLY);
        for i in 0..256 {
            let mut crc = tab[0][i];
            for j in 1..8 {
                crc = (crc >> 8) ^ tab[0][crc as u8 as usize];
                tab[j][i] = crc;
            }
        }
        tab
    };
}

fn read_u32(buf: &[u8]) -> u32 {
  return buf[0] as u32 + ((buf[1] as u32) << 8) + ((buf[2] as u32) << 16) + ((buf[3] as u32) << 24)
}

fn crc32c_slice8(mut buf: &[u8]) -> u32 {
    let tab = &*TABLE;
    let tab8 = &*TABLE8;
    let mut crc: u32 = !0;
    while buf.len() >= 8 {
        crc ^= read_u32(&buf[0..4]);
        crc = tab8[0][buf[7] as usize]
            ^ tab8[1][buf[6] as usize]
            ^ tab8[2][buf[5] as usize]
            ^ tab8[3][buf[4] as usize]
            ^ tab8[4][(crc >> 24) as u8 as usize]
            ^ tab8[5][(crc >> 16) as u8 as usize]
            ^ tab8[6][(crc >> 8 ) as u8 as usize]
            ^ tab8[7][(crc      ) as u8 as usize];
        buf = &buf[8..];
    }
    for &b in buf {
        crc = tab[((crc as u8) ^ b) as usize] ^ (crc >> 8);
    }
    !crc
}

fn make_table(poly: u32) -> [u32; 256] {
    let mut tab = [0; 256];
    for i in 0u32..256u32 {
        let mut crc = i;
        for _ in 0..8 {
            if crc & 1 == 1 {
                crc = (crc >> 1) ^ poly;
            } else {
                crc >>= 1;
            }
        }
        tab[i as usize] = crc;
    }
    tab
}

#[no_mangle]
pub extern fn crc32(ptr: *mut u8, length: u32) -> u32 {
  unsafe {
    let buf : &[u8] = std::slice::from_raw_parts(ptr, length as usize);
    return crc32c_slice8(buf);
  }
}